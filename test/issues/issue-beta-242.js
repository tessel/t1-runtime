var tap = require('../tap');

tap.count(1);

(function () {
  var Peripheral = require('./lib/peripheral');
  var Descriptor = require('./lib/descriptor');
  var Characteristic = require('./lib/characteristic');
  var Service = require('./lib/service');
  var Messenger = require('./lib/messenger');
  var UUID = require('./lib/uuid');
  var Address = require('./lib/address');
  var attributes = require('./lib/attributes.json');
  var events = require('events');
  var util = require('util');
  var async = require('async');


  /*************************************************************
  Function:     connect
  Description:  Set the module port of the Bluetooth module
          so the Tessel can begin communicating.
  Params:     hardware - the module port ble was plugged in to
          callback - a callback for what happens after connecting
  *************************************************************/
  function use(hardware, callback) {
    var controller = new BluetoothController(hardware, callback);

    return controller;
  }

  /*************************************************************
  Function:     BluetoothController
  Description:  Instantiate a Bluetooth Controller object. Controls
          all BLE Central and Peripheral methods (depending)
          on role.
  Params:     hardware - the module port ble was plugged in to
  *************************************************************/
  function BluetoothController(hardware, callback) {
    this.hardware = hardware;
    this.isAdvertising = false;
    this.messenger = new Messenger(hardware);
    this._connectedPeripherals = {};
    this._discoveredPeripherals = {};

    this._firmwareVersionHandle = 17;
    this._maxNumValues = { "1.0.1" : 12}
    this._localHandles = [21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65];

    this._MITMEnabled = false;
    this._minKeySize = 7;

    this.messenger.on('scanStart', this.onScanStart.bind(this));
    this.messenger.on('scanStop', this.onScanStop.bind(this));
    this.messenger.on('discover', this.onDiscover.bind(this));
    this.messenger.on('connectionStatus', this.onConnectionStatus.bind(this));
    this.messenger.on('disconnect', this.onDisconnect.bind(this));
    this.messenger.on('groupFound', this.onGroupFound.bind(this));
    this.messenger.on('completedProcedure', this.onCompletedProcedure.bind(this));
    this.messenger.on('findInformationFound', this.onFindInformationFound.bind(this));
    this.messenger.on('attributeValue', this.onAttributeValue.bind(this));
    this.messenger.on('remoteWrite', this.onRemoteWrite.bind(this));
    this.messenger.on('remoteStatus', this.onRemoteStatus.bind(this));
    this.messenger.on('portStatus', this.onPortStatus.bind(this));
    this.messenger.on('ADCRead', this.onADCRead.bind(this));
    this.messenger.on('bondStatus', this.onBondStatus.bind(this));

    // Once the messenger says we're ready, call callback and emit event
    this.messenger.once('ready', this.bootSequence.bind(this, callback));

    // If there was an error, let us know
    this.messenger.once('error', this.bootSequence.bind(this, callback));
  }

  util.inherits(BluetoothController, events.EventEmitter);

  BluetoothController.prototype.bootSequence = function(callback, err) {

  // Tell any ble listeners
    if (!err) {
      this.createGPIOs()
      setImmediate(function() {
        this.emit('ready');
      }.bind(this));
    }
    else {
      // Emit the error
      setImmediate(function() {
        this.emit('error', err);
      }.bind(this));
    }

    this.messenger.removeAllListeners('error');
    this.messenger.removeAllListeners('ready');

    // Call the callback
    callback && callback(err);
  }

  BluetoothController.prototype.reset = function(callback) {
    this.messenger.reset(callback);
  }
  /**********************************************************
   Event Handlers
  **********************************************************/
  BluetoothController.prototype.onScanStart = function(err, result) {
    this.emit('scanStart', err);
  }

  BluetoothController.prototype.onScanStop = function(err, result) {
    this.emit('scanStop', err);
  }

  BluetoothController.prototype.onDiscover = function(peripheralData) {
    // Try to grab this peripheral from list of previously discovered peripherals
    this.getPeripheralFromData(peripheralData.rssi, peripheralData.data, peripheralData.sender, peripheralData.address_type, function(peripheral, undiscovered) {
    // If this peripheral hasn't been discovered or we allow duplicates
      if (undiscovered || (this._allowDuplicates)) {
        // If we are not filtering UUIDs or we are and this is a match
        if (!this.filteredUUIDs.length || this.matchAdvDataUUID(peripheralData.data)) {
          // Emit the event
          setImmediate(function() {
            this.emit('discover', peripheral);
          }.bind(this));
        }
      }
    }.bind(this));
  }

  BluetoothController.prototype.matchAdvDataUUID = function(data) {
    for (var i in data) {
      var datum = data[i];

      // For each piece of advertising data
      if (datum.typeFlag >= 2 && datum.typeFlag <= 7) {
        // For each uuid in each datum
        for (var j in datum.data) {
          // Grab the uuid
          var uuid = datum.data[j];
          // Strip the '0x'
          uuid = uuid.substr(2).toLowerCase();

          // For each filter uuid
          for (var k in this.filteredUUIDs) {
            // Grab the filter
            var filter = this.filteredUUIDs[k];
            // If it's a match
            if (filter === uuid) {
              // return true
              return true;
            }
          }

        }
      }
    }

    // No matches found
    return false;
  }

  BluetoothController.prototype.onConnectionStatus = function(status) {
    // If we're advertising in slave mode
    if (this.advertising) {
      // Emit that we connected with the connection number
      setImmediate(function() {
        this.emit('connect', status.connection);
      }.bind(this));
    }
    // If we're in master mode
    else {
      // Grab the peripheral
      this.getPeripheralFromData(null, null, status.address, status.address_type, function(peripheral, undiscovered) {

        if (peripheral) {
          // Set the connection number and flags
          peripheral.connection = status.connection;
          peripheral.flags = status.flags;
          peripheral.bondHandle = status.bonding;

          // Save it in our data structure
          this._connectedPeripherals[peripheral.connection] = peripheral;

          // If this new connection was just made
          // Let any listeners know
          if (peripheral.flags & (1 << 2)) {
            peripheral.connected = true;
            setImmediate(function() {
              this.emit('connect', peripheral);
            }.bind(this));
          }
        }
      }.bind(this));
    }
    this.emit('connectionStatus', status);
  }

  BluetoothController.prototype.onDisconnect = function(response) {

    var peripheral = this._connectedPeripherals[response.connection];

    // If we have a peripheral (we're acting as master)
    if (peripheral) {
      // Set the flags
      peripheral.flags = 0;
      peripheral.connection = null
      peripheral.connected = false;

      // Emit the event
      setImmediate(function() {
        this.emit('disconnect', peripheral, response.reason);
      }.bind(this));
    }
    // If we're acting as slave
    else {
      // Emit event with connection param
      setImmediate(function() {
        this.emit('disconnect', response.connection, response.reason);
      }.bind(this));
    }
  }

  /*
   Called when services or groups found
  */
  BluetoothController.prototype.onGroupFound = function(group) {
    this.emit('groupFound', group);
  }
  /*
   Called when discovery operation completed
  */
  BluetoothController.prototype.onCompletedProcedure = function(procedure) {
    this.emit('completedProcedure', procedure);
  }

  /*
   Called when characteristic discovery is complete
   */
  BluetoothController.prototype.onFindInformationFound = function(info) {
    this.emit('findInformationFound', info);
  }

  /*
   Called when an attribute value is found
   */
  BluetoothController.prototype.onAttributeValue = function(value) {
    // We have a notification
    if (value.type === 1) {
      // Grab the peripheral responsible
      var peripheral = this._connectedPeripherals[value.connection];
      // If it exists (it better!)
      if (peripheral) {
        // Grab the corresponding characteristic
        var characteristic = peripheral.characteristics[value.atthandle];
        // If it exists (it better!)
        if (characteristic) {
          // Set the value
          characteristic.value = value.value;

          // Emit events
          this.emit('notification', characteristic, characteristic.value);
          peripheral.emit('notification', characteristic, characteristic.value);
          characteristic.emit('notification', characteristic.value);
        }
      }
    }
    // We have an indication
    else if (value.type === 2 || value.type === 5) {
      // Grab the peripheral responsible
      var peripheral = this._connectedPeripherals[value.connection];
      // If it exists (it better!)
      if (peripheral) {
        // Grab the corresponding characteristic
        var characteristic = peripheral.characteristics[value.atthandle];
        // If it exists (it better!)
        if (characteristic) {
          // Set the value
          characteristic.value = value.value;

          // Emit events
          this.emit('indication', characteristic, characteristic.value);
          peripheral.emit('indication', characteristic, characteristic.value);
          characteristic.emit('indication', characteristic.value);
        }
      }
    }

    setImmediate(function() {
      this.emit('attributeValue', value);
    }.bind(this));
  }

  BluetoothController.prototype.onRemoteWrite = function(value) {
    // If the master is requesting confirmation
    if (value.reason === 2) {
      this.messenger.remoteWriteAck(value.connection, 0x00, function(err, response) {
          // TODO: Do we need anything with this response?
      });
    }
    var index = this._localHandles.indexOf(value.handle);
    if (index != -1) {
      setImmediate(function() {
        this.emit('remoteWrite', value.connection, index, value.value);
      }.bind(this));
    }
  }

  BluetoothController.prototype.onRemoteStatus = function(status) {
    var index = this._localHandles.indexOf(status.handle);
    if (index != -1) {
      var action;
      if (status.flags === 0) {
        action = "remoteUpdateStop";
      }
      if (status.flags === 1) {
        action = "remoteNotification";
      }
      else if (status.flags === 2) {
        action = "remoteIndication";
      }

      setImmediate(function() {
        this.emit(action, index);
      }.bind(this));
    }
  }

  BluetoothController.prototype.onPortStatus = function(portStatus) {
    // Iterate through gpios
    for (var id in this.gpios) {
      var gpio = this.gpios[id];
      // If it's the right port and pin
      if (gpio._port == portStatus.port && (portStatus.irq & (1 << gpio._pin))) {
        // Set the correct type of interrupt
        var type = (portStatus.state & (1 << gpio._pin)) ? "rise" : "fall";
        // Emit that type as well as the change type
        setImmediate(function() {
          gpio.emit("change", null, portStatus.timestamp, type);
          gpio.emit(type, null, portStatus.timestamp, type);
        });
      }
    }
  }

  BluetoothController.prototype.onADCRead = function(adcRead) {
    this.emit('ADCRead', adcRead);
  }

  BluetoothController.prototype.onBondStatus = function(bondStatus) {
    this.emit('bondStatus', bondStatus);
  }

  /**********************************************************
   Bluetooth API
  **********************************************************/
  BluetoothController.prototype.startScanning = function(options, callback) {

    // If the user just passed in a function, make allow duplicates a null
    if (typeof options == "function") {
      callback = options;
      options = {};
    }

    this.allowDuplications = (options.allowDuplicates ? true : false);

    this.filteredUUIDs = (options.serviceUUIDs ? options.serviceUUIDs : []);

    // Reset discovered peripherals
    this._discoveredPeripherals = {};

    // Start scanning
    this.messenger.startScanning(this.manageRequestResult.bind(this, 'scanStart', callback));
  }

  BluetoothController.prototype.stopScanning = function(callback) {
    this.messenger.stopScanning(this.manageRequestResult.bind(this, 'scanStop', callback));
  }

  BluetoothController.prototype.manageRequestResult = function(event, callback, err, response) {
    // If there wasn't an error
    if (!err) {
      // Emit the event
      setImmediate(function() {
        this.emit(event);
      }.bind(this));
    }
    else {
      setImmediate(function() {
        this.emit('error', err);
      }.bind(this));
    }

    // Call the callback
    callback && callback(err);
  }
  g
  BluetoothController.prototype.getPeripheralFromData = function(rssi, data, address, addressType, callback) {

    var addr = new Address(address);
    // Try to grab this peripheral from list of previously discovered peripherals
    var peripheral = this._discoveredPeripherals[addr.toString()];

    // If it hasn't been discovered yet
    if (!peripheral) {
      // Make a peripheral object from the data
      peripheral = new Peripheral(
                  this,
                  rssi,
                  data,
                  addr);

      peripheral.addressType = addressType;

      // Put it in our discovered data structure
      this._discoveredPeripherals[addr.toString()] = peripheral;

      callback && callback(peripheral, true);
    }
    else {
      callback && callback(peripheral, false);
    }
  }

  BluetoothController.prototype.connect = function(peripheral, callback) {
    this.messenger.connect(peripheral.address.toBuffer(), peripheral.addressType, function(err, response) {
      // If there was an error
      if (err) {
        // Call the callback
        return callback && callback(err);
      }

      // If there wasn't
      else {
        var self = this;
        function connectCallback(connectedPeripheral) {
          if (peripheral === connectedPeripheral) {

            // Remove this listener
            self.removeListener('connect', connectCallback);

            // Call the callback
            callback && callback();

            setImmediate(function() {
              // Let any listeners know
              self.emit('connect', peripheral);
              peripheral.emit('connect');
            });
          }
        };
        // Wait for a connection Update
        this.on('connect', connectCallback);
      }
    }.bind(this));
  }

  BluetoothController.prototype.disconnect = function(peripheral, callback) {
    this.messenger.disconnect(peripheral.connection, function(err, response) {
      // If there was an error
      if (err) {
        // Call the callback
        return callback && callback(err);
      }
      else {
        // Wait for a connection Update
        this.on('disconnect', function disconnectCallback(disconnectedPeripheral) {
          if (disconnectedPeripheral === peripheral) {

            // Remove this listener
            this.removeListener('disconnect', disconnectCallback);

            // Call the callback
            callback && callback(reason);

            setImmediate(function() {
              // Let any listeners know
              peripheral.emit('disconnect', reason);
            }.bind(this));
          }
        }.bind(this));
      }
    }.bind(this));
  }
  BluetoothController.prototype.discoverAllAttributes = function(peripheral, callback) {
    // Discover all of our services and characteristics
    this.discoverAllServicesAndCharacteristics(peripheral, function(err, results) {
      var funcs = [];
      for (var characteristic in results.characteristics) {
        funcs.push(this.discoverDescriptorsOfCharacteristic.bind(this, results.characteristics[characteristic]));
      }
      // Get an array of arrays of descriptors
      async.series(funcs, function(err, charDescriptors) {
        // Make return array
        var allDescriptors = []
        // For each array of descriptors
        for (var i in charDescriptors) {
          // For each descriptor in that array
          for (var descriptor in charDescriptors[i]) {
            // Push the descriptor
            allDescriptors.push(charDescriptors[i][descriptor]);
          }
        }

        // Add descriptors to the resulting object
        results["descriptors"] = allDescriptors;

        // Call the callback
        callback && callback(err, results);
      });
    }.bind(this));
  }

  BluetoothController.prototype.discoverAllServices = function(peripheral, callback)
  {
    this.discoverServices(peripheral, [], callback);
  }

  BluetoothController.prototype.discoverServices = function(peripheral, filter, callback)
  {
    // Discover the services of this device
    this.serviceDiscovery(peripheral, function(err, allServices) {
      if (err) {
        return callback && callback(err);
      }
      else {
        this.attributeDiscoveryHandler(err, filter, allServices, function(err, services) {

          // Return the values
          callback && callback(err, services);

          if (!err && services.length) {
            // Set the events to be emitted.
            setImmediate(function() {
              this.emit('servicesDiscover', services);
              peripheral.emit('servicesDiscover', services);
            }.bind(this));
          }
        }.bind(this));
      }
    }.bind(this));
  }

  // TODO: Implement this function
  BluetoothController.prototype.discoverIncludedServices = function(peripheral, serviceUUID) {

    this.on('groupFound', this.createService)
    this.messenger.discoverIncludedServices(peripheral, serviceUUID, callback);
  }

  BluetoothController.prototype.serviceDiscovery = function(peripheral, callback) {

    var services = [];

    // The 'groupFound' event is called when we find a service
    var groupFoundListener = this.createServiceFromGroup.bind(this, peripheral, services);

    this.on('groupFound', groupFoundListener);

    var self = this;
    // The 'completed Procedure' event is called when we're done looking for services
    this.on('completedProcedure', function serviceDiscoveryComplete(procedure) {
      // If this was called for this peripheral
      if (procedure.connection === peripheral.connection) {

        // Remove the listener
        self.removeListener('groupFound', groupFoundListener);
        self.removeListener('completedProcedure', serviceDiscoveryComplete);

        // Call the callback
        callback && callback(null, services);
      }
    });

    // Request the messenger to start discovering services
    this.messenger.discoverServices(peripheral, function(err, response) {
      // If there was a problem with the request
      if (err) {
        // Call callback immediately
        return callback && callback(err);
      }
    }.bind(this));
  }
  BluetoothController.prototype.attributeDiscoveryHandler = function(err, filter, attributes, callback) {
    // If there was an error, report it
    if (err) {
      callback && callback(err);

      setImmediate(function() {
        this.emit('error', err);
      }.bind(this));

      return;
    }
    // If not
    else {
      // Create a return array
      var ret = [];
            // If consumer has requested a subset of services
      if (filter.length != 0) {
        // Iterate through the services requested
        for (var i = 0; i < filter.length; i++) {
          // Convert filter to lower case
          var match = filter[i].toLowerCase();
          // If the service details exist and was returned
          for (var j = 0; j < attributes.length; j++) {
            // If the attribute's uuid is the filter
            if (attributes[j].uuid.toString() == match) {
              // Add it to the array
              ret.push(attributes[j]);
              break;
            }
          }
        }
      }
      // If the consumer has requested all services
      else {
        ret = attributes;
      }

      // Return the values
      callback && callback(null, ret);
    }
  }

  BluetoothController.prototype.createServiceFromGroup = function(peripheral, ret, groupItem) {
    // If this is the right peripheral
    if (groupItem.connection === peripheral.connection) {
      // Convert the UUID to a string instead of buffer
      var uuid = new UUID(groupItem.uuid);

      var service;

      // If the service doesn't already exist
      if (!(service = peripheral[uuid.toString()])) {
        // Make a new service
        service = new Service(peripheral, uuid, groupItem.start, groupItem.end);

        // Add this services to the peripherals data structure
        peripheral.syncService(service);
      }

      // Add to the service we will report as having discovered
      ret.push(service);
    }
  }

  BluetoothController.prototype.discoverAllCharacteristics = function(peripheral, callback) {

    this.discoverAllServices(peripheral, function(err, services) {
      if (err) {
        return callback && callback(err);
      }
      else {
        var characteristics = [];

        var self = this;

        var discoveryListener = this.createCharacteristicFromInformationFound.bind(this, peripheral, characteristics);

        this.on('findInformationFound', discoveryListener);

        this.on('completedProcedure', function charDiscoveryComplete(procedure) {
          if (procedure.connection === peripheral.connection) {

            self.removeListener('findInformationFound', discoveryListener);
            self.removeListener('completedProcedure', charDiscoveryComplete);

            // If it didn't succeed
            if (procedure.result != 0) {

              callback && callback(procedure.result, null);
            }
            else {

              callback && callback(null, characteristics);

              setImmediate(function() {
                self.emit('characteristicsDiscover', characteristics);
                peripheral.emit('characteristicsDiscover', characteristics);
              });
            }
          }
        });

        this.messenger.discoverAllAttributes(peripheral, function(err, response) {
          // If there was a problem with the request
          if (err) {
            // Call callback immediately
            return callback && callback(err);
          }
        }.bind(this));
      }
    }.bind(this));
  }

  // TODO: Make work with actual array
  BluetoothController.prototype.discoverCharacteristics = function(peripheral, uuids, callback) {

    // Somehow assemble the functions such that the next element is the callback to the previous
    var funcs = [];
    for (var i = 0; i < uuids.length; i++) {
      funcs.push(this.discoverCharacteristic.bind(this, peripheral, new UUID(uuids[i])));
    }

    async.series(funcs, function(err, characteristics) {

      callback && callback(err, characteristics)

      if (!err && characteristics.length) {
        setImmediate(function() {
          this.emit('characteristicsDiscover', characteristics);
          peripheral.emit('characteristicsDiscover', characteristics);
        }.bind(this));
      }

    }.bind(this));
  }

  BluetoothController.prototype.discoverCharacteristic = function(peripheral, characteristicUUID, callback) {

    var self = this;
    var ret = [];
    var listener = this.createCharacteristicFromAttributeValue.bind(this, peripheral, ret);

    this.on('attributeValue', listener);

    function charDiscoveryComplete(procedure) {
      if (procedure.connection === peripheral.connection) {
        if (procedure.result != 0) {
          callback && callback(procedure.result);
        }
        else {

          self.removeListener('attributeValue', listener);
          self.removeListener('completedProcedure', charDiscoveryComplete);

          if (ret.length != 1) {
            return callback && callback(null, []);
          }
          else {
            self.discoverCharacteristicUUID(peripheral, ret[0], callback);
          }
        }
      }
    }

    this.on('completedProcedure', charDiscoveryComplete);

    // Request only the value of the characteristic with this handle
    this.messenger.discoverCharacteristicsInRangeForUUID(peripheral, 0x0001, 0xFFFF, characteristicUUID, function(err, response) {
      // If there was a problem with the request
      if (err) {
        // Call callback immediately
        return callback && callback(err);
      }
    }.bind(this));
  }

  BluetoothController.prototype.discoverCharacteristicUUID = function(peripheral, characteristic, callback) {

    // Save reference to self
    var self = this;

    function setCharacteristicUUID(info) {

      // If this is for the correct connection and char handle
      if (peripheral.connection === info.connection
        && characteristic.handle === info.chrhandle) {

        // Set the uuid of this characteristic
        characteristic.setUUID(new UUID(info.uuid));

        // Sync the new one with the correct service
        peripheral.syncCharacteristic(characteristic);

        // Remove this listener
        self.removeListener('findInformationFound', setCharacteristicUUID);
      }
    }

    // Once we have found info containing UUID about this char
    this.on('findInformationFound', setCharacteristicUUID);

    function procedureComplete(procedure) {

      // If this was called for this peripheral
      if (procedure.connection === peripheral.connection) {

        // Stop listening for more characteristics
        self.removeListener('completedProcedure', procedureComplete);

        // If it didn't succeed
        if (procedure.result != 0) {

          // Call the callback with the error
          callback && callback(procedure.result, null);
        }
        else {
          // Call the callback with result
          callback && callback(null, characteristic);
        }
      }
    }

    // Once we complete the search
    this.on('completedProcedure', procedureComplete);

    // Tell the messenger to begin the search for the uuid of this characteristic
    this.messenger.discoverCharacteristicUUID(characteristic, function(err, response) {
    // If there was a problem with the request
      if (err) {
        // Call callback immediately
        callback && callback(err);
      }
    }.bind(this));
  }

  /*
  * Method for turning a bit of information into a characteristic. Must discover all services before calling. (sucks, I know)
  */
  BluetoothController.prototype.discoverAllServicesAndCharacteristics = function(peripheral, callback) {

    // Discover all characteristics already requires a discovery of all services
    this.discoverAllCharacteristics(peripheral, function(err, characteristics) {
      // If there is an error
      if (err) {
        // Call the callback
        callback && callback(err);
      }
      // If there is no error
      else {
        // Services to return
        var services = [];

        // For each service in this peripheral
        for (var service in peripheral.services) {
          // Push it into the array
          services.push(peripheral.services[service]);
        }
        // Call callback with our results
        callback && callback(err, {services : services, characteristics : characteristics});
      }
    }.bind(this));
  }
  BluetoothController.prototype.createCharacteristicFromInformationFound = function(peripheral, ret, info) {
    if (peripheral.connection === info.connection) {
      // Turn the uuid into a string
      var uuid = new UUID(info.uuid);
      // If this uuid isn't a service or a descriptor, or any other generic type
      if (!peripheral.services[uuid.toString()] &&
          !Service.isStandardService(uuid.toString()) &&
          !(Descriptor.isStandardDescriptor(uuid.toString())) &&
          !attributes[uuid.toString()]) {

        // Make a new one
        var characteristic = new Characteristic(peripheral, uuid, info.chrhandle);

        // Sync the new one with the correct service
        peripheral.syncCharacteristic(characteristic);

        // Push it into the return array
        ret.push(characteristic);
      }
    }
  }
  BluetoothController.prototype.createCharacteristicFromAttributeValue = function(peripheral, ret, value) {
    // If this is the correct connection
    if (peripheral.connection === value.connection) {
      // Create the characteristic
      var characteristic = new Characteristic(peripheral, null, value.atthandle, value.value);
      // Add to the characteristics we will report as having discovered
      ret.push(characteristic);
    }
  }

  BluetoothController.prototype.discoverAllCharacteristicsOfService = function(service, callback) {
    this.discoverCharacteristicsOfService(service, [], callback);
  }

  // TODO: This currently writes new characteristics over old ones because we have no way of
  // checking which characteristics we should construct and what we shouldn't
  BluetoothController.prototype.discoverCharacteristicsOfService = function(service, filter, callback) {

    // Discover the characteristics of this specific service
    this.serviceCharacteristicDiscovery(service, function(err, allCharacteristics) {
      // Format results and report any errors
      this.attributeDiscoveryHandler(err, filter, allCharacteristics, function(err, characteristics) {

        // Call that callback
        callback && callback(err, characteristics);
        // If we have characteristics to report
        if (characteristics.length) {
          // Also emit it from appropriate sources
          setImmediate(function() {
            this.emit('characteristicsDiscover', characteristics);
            service._peripheral.emit('characteristicsDiscover', characteristics);
            service.emit('characteristicsDiscover', characteristics);
          }.bind(this));
        }
      }.bind(this));
    }.bind(this));
  }

  BluetoothController.prototype.serviceCharacteristicDiscovery = function(service, callback) {
    // Save reference to self
    var self = this;

    var characteristics = [];

    var listener = this.createCharacteristicFromInformationFound.bind(this, service._peripheral, characteristics);

    // Once we have found info containing UUID about this char
    this.on('findInformationFound', listener);

    // Once we complete the search
    this.on('completedProcedure', function procedureComplete(procedure) {

      // If this was called for this peripheral
      if (procedure.connection === service._peripheral.connection) {

        // Stop listening for more characteristics
        self.removeListener('completedProcedure', procedureComplete);
        self.removeListener('findInformationFound', listener);

        // If it didn't succeed
        if (procedure.result != 0) {

          // Call the callback with the error
          callback && callback(procedure.result, null);
        }
        else {
          // Call the callback with result
          callback && callback(null, characteristics);
        }
      }
    });

    // Tell the messenger to begin the search for the uuid of this characteristic
    this.messenger.discoverCharacteristicsInRange(service._peripheral, service._startHandle, service._endHandle, function(err, response) {
    // If there was a problem with the request
      if (err) {

        // Call callback immediately
        callback && callback(err);
      }
    }.bind(this));
  }

  BluetoothController.prototype.read = function(characteristic, callback) {
    this.readAttribute(characteristic, function(err, value) {
      characteristic.value = value;

      callback && callback(err, value);

      if (value) {
        this.emit('characteristicRead', characteristic, value);
        characteristic._peripheral.emit('characteristicRead', characteristic, value);
        characteristic.emit('characteristicRead', value);
      }
    }.bind(this));
  }

  BluetoothController.prototype.readAttribute = function(attribute, callback) {

    var readNum = 0;

    var self = this;

    var ret;

    function valueListener(reading) {
      // If this is our first read of several or if this will be the only read
      if (readNum === 0 || (reading.type == 0)) {
        // Assign the value
        ret = reading.value;
      }
      // If not
      else {
        // Concat the buffers
        ret = Buffer.concat([ret, reading.value]);
      }
      readNum++;
    }

    this.on('attributeValue', valueListener);

    function attributeReadComplete(procedure) {

      // If this was called for this peripheral
      if (procedure.connection === attribute._peripheral.connection) {

        // Stop listening for more characteristics
        self.removeListener('attributeValue', valueListener);
        self.removeListener('completedProcedure', attributeReadComplete);

        // If it didn't succeed
        if (procedure.result != 0) {

          callback && callback(procedure.result, null);
        }
        else {
          // Call the callback
          callback && callback(null, ret);
        }
      }
    }

    // The 'completed Procedure' event is called when we're done looking for services
    this.on('completedProcedure', attributeReadComplete);

      // Request the messenger to start discovering services
    this.messenger.readHandle(attribute._peripheral, attribute, function(err, response) {
      // If there was a problem with the request
      if (err) {
        // Call callback immediately
        callback && callback(err);
      }
    }.bind(this));
  }


  BluetoothController.prototype.write = function(characteristic, value, callback) {
    this.writeAttribute(characteristic, value, function(err, written) {

      callback && callback(err, written);

      if (!err) {
        setImmediate(function() {
          this.emit('characteristicWrite', characteristic, written);
          characteristic._peripheral.emit('characteristicWrite', characteristic, written);
          characteristic.emit('write', written);
        }.bind(this));
      }
    }.bind(this));
  }
  BluetoothController.prototype.writeAttribute = function(attribute, value, callback) {

    // Write has to be in 20 byte increments
    this.splitWriteIntoBuffers(value, function(err, buffers) {
      if (err) {
        return callback && callback(err);
      }
      else {
        // If there is only one buffer
        if (buffers.length == 1) {
          // We can send it immediately
          this.writeAttributeImmediately(attribute, buffers[0], callback);
        }
        else {
          // If there are multiple buffers, we've got to prepare several writes, then execute
          this.prepareAttributeWrite(attribute, buffers, callback);
        }
      }
    });
  }
  BluetoothController.prototype.writeAttributeImmediately = function(attribute, singleBuffer, callback) {
    // The 'completed Procedure' event is called when we're done writing
    this.once('completedProcedure', function(procedure) {

      // If this was called for this peripheral
      if (procedure.connection === attribute._peripheral.connection &&
            procedure.chrhandle === attribute.handle) {

        // If it didn't succeed
        if (procedure.result != 0) {

          callback && callback(procedure.result, null);
        }
        else {
          // Call the callback
          callback && callback(null, singleBuffer);
        }
      }
    }.bind(this));

    this.messenger.writeAttributeImmediately(attribute, singleBuffer, function(err, response) {
      // If there was a problem with the request
      if (err) {
        // Call callback immediately
        return callback && callback(err);
      }
    })
  }

  BluetoothController.prototype.prepareAttributeWrite = function(attribute, multipleBuffers, callback) {
    var bufSize = 20;
    var offset = 0;

    // Keep this around
    var self = this;

    function bufferWriteIterate(procedure) {
      // If this is for our connection
      if (procedure.connection === attribute._peripheral.connection
        && procedure.chrhandle === attribute.handle) {
        // If there was an error, report it and cancel write
        if (procedure.result != 0) {
          // Cancel any previous writes
          self.messenger.cancelWrite(attribute, function(cancelErr, response) {
            // Call callback immediately
            return callback && callback(procedure.result);
          });
        }
        // If there was no error
        else {
          // If we've completed the procedure but still have more to write
          if (offset < multipleBuffers.length) {

            // Send another part of the buffer off
            self.messenger.prepareWrite(attribute, multipleBuffers[offset], offset*bufSize, function(err, response) {
              // If there was a problem with the request
              if (err) {
                // Cancel any previous writes
                self.messenger.cancelWrite(attribute, function(cancelErr, response) {

                  // Call callback immediately
                  return callback && callback(err);
                });
              }
              // Increment offset so we send the next buffer next time
              offset++;
            });
          }
          // If we've sent all the prepare writes...
          else if (offset === multipleBuffers.length) {
            // Remove the buffer write iterator listener so we don't send any more packets
            self.removeListener('completedProcedure', bufferWriteIterate);

            // Once our write execution is complete
            self.once('completedProcedure', function(procedure) {
              // If there was an error
              if (procedure.result != 0) {
                // Report the error
                callback && callback(procedure.result);
              }
              // If there was no error
              else {
                //Concat all the buffers into one
                var ret;
                for (var i = 0; i < multipleBuffers.length; i++) {
                  ret = Buffer.concat(ret, multipleBuffers[i]);
                }

                // Call callback
                callback && callback(null, ret);
              }
            });
            // Execute the write of the packets
            self.messenger.executeWrite(attribute, function(err, response) {
              // If there was a problem with the request
              if (err) {
                // Call callback immediately
                return callback && callback(err);
              }
            });
          }
        }
      }
    }

    // Function for writing each subsequent buffer
    this.on('completedProcedure', bufferWriteIterate);

    this.messenger.prepareWrite(attribute, multipleBuffers[offset], offset * bufSize, function(err, response) {
      // If there was a problem with the request
      if (err) {
        // Call callback immediately
        return callback && callback(err);
      }
      offset++;
    });
  }

  BluetoothController.prototype.splitWriteIntoBuffers = function(value, callback) {
    // If nothing was passed in, just return an error
    if (!value) {
      return callback && callback(new Error("No value passed to write function"));
    }
    // If something was passed in
    else {
      var buf;

      // If it is a string, make a buf with utf-8 encoding
      if (typeof value === "string") {
        buf = new Buffer(value);
      }
      // If it's already a buffer, keep as is
      else if (Buffer.isBuffer(value)) {
        buf = value;
      }
      // If it's a number
      else if (!isNaN(value)) {
        // Make a new buffer for the 32 bit number
        buf = new Buffer(4);
        buf.writeUInt32BE(value, 0);
      }
      // If none of the above, it's invalid. Throw an error
      else {
        return callback && callback("Can only write strings, numbers, and buffers.");
      }

      // Max number of bytes per buffer
      var maxBufLen = 20;
      var maxNumBufs = 5;

      // Get the number of buffers we'll need
      var iter = Math.ceil(buf.length/maxBufLen);

      // Prepare array for buffers
      var ret = new Array(iter);
      // For each buffer
      for (var i = 0; i < iter; i++) {
        // Grab the start byte
        var start = i * maxBufLen;
        // Put that start plus next 20 bytes (or if it's the last, just grab remainder)
        var end = (i == iter-1 ? buf.length % maxBufLen : maxBufLen);
        // Slice it and throw it into our return array
        ret[i] = buf.slice(start, start + end);
      }

      if (ret.length > maxNumBufs) {
        callback && callback(new Error("Write data must be 100 bytes or less"));
      }
      else {
        // Return array
        callback && callback(null, ret);
      }
    }
  }

  /*
  * Continues reading and storing subsequent handles of a characteristic until a non-descriptor is found
  */
  BluetoothController.prototype.discoverDescriptorsOfCharacteristic = function(characteristic, callback) {

    var self = this;

    var descriptors = [];

    var offset = 1;

    var done = false;

    function findDescriptorInformation(info) {

      // If this for the correct connection
      if (characteristic._peripheral.connection === info.connection) {

        // Turn the uuid into a string
        var uuid = new UUID(info.uuid);

        // If this uuid isn of a descriptor
        if (Descriptor.isStandardDescriptor(uuid.toString())) {

          // Make a new one
          var descriptor = new Descriptor(characteristic._peripheral, uuid, info.chrhandle);

          // Add it to the characteristic's descriptors
          characteristic.descriptors[uuid.toString()] = descriptor;

          // Push it into the return array
          descriptors.push(descriptor);
        }
        else {
          // Set the done flag
          done = true;

          // Remove this listener
          self.removeListener('findInformationFound', findDescriptorInformation);
        }
      }
    }

    // Keep reading the next handle until it is not a descriptor
    this.on('findInformationFound', findDescriptorInformation);

    function descriptorDiscoveryComplete(procedure) {

      // If this was called for this peripheral
      if (procedure.connection === characteristic._peripheral.connection) {

        // If it didn't succeed
        if (procedure.result != 0) {

          // If the error is not that their is no Attribute found (which will happen
          // if the final characteristic is called upon)
          if (procedure.result.message != 'Attribute Not Found') {

            // Call the callback with the error
            callback && callback(procedure.result, null);

            // Emit the event
            setImmediate(function() {
              self.emit('error', procedure.result);
            });

            return;
          }
          else {
            done = true;
          }
        }

        // If we have finished finding all descriptors
        if (done) {

          // Stop listening for more descriptors
          self.removeListener('completedProcedure', descriptorDiscoveryComplete);

          // Call the callback with result
          callback && callback(null, descriptors);

          // Emit events
          setImmediate(function() {
            self.emit('descriptorsDiscover', descriptors);
            characteristic._peripheral.emit('descriptorsDiscover', descriptors);
          });
        }
        // If we have not finished finding descriptors
        else {

          // Increase the offset
          offset++;

          // And make the call for the next attribute
          self.messenger.findHandle(characteristic._peripheral, characteristic.handle + offset, function(err, response) {
            // If there was a problem with the request
            if (err) {

             // Call callback immediately
             callback && callback(err);

             setImmediate(function() {
               self.emit('error', err);
             });
            }
          });
        }
      }
    }

    // Once we have finished finding a single descriptor
    this.on('completedProcedure', descriptorDiscoveryComplete);

    // Read the first subsequent handle
    this.messenger.findHandle(characteristic._peripheral, characteristic.handle + offset, function(err, response) {
      // If there was a problem with the request
      if (err) {

        // Call callback immediately
        callback && callback(err);

        // Emit the error
        setImmediate(function() {
          this.emit('error', err);
        }.bind(this))
      }
    }.bind(this));
  }

  BluetoothController.prototype.readDescriptor = function(descriptor, callback) {
    this.readAttribute(descriptor, function(err, value) {
      descriptor.value = value;

      callback && callback(err, value);

      if (value) {
        setImmediate(function() {
          this.emit('descriptorRead', descriptor, value);
          descriptor._peripheral.emit('descriptorRead', descriptor, value);
          descriptor.emit('descriptorRead', value);
        }.bind(this));
      }
    }.bind(this));
  }

  BluetoothController.prototype.writeDescriptor = function(descriptor, value, callback) {
    this.writeAttribute(descriptor, value, function(err, written) {

      callback && callback(err, written);

      if (!err) {
        setImmediate(function() {
          this.emit('descriptorWrite', descriptor, written);
          descriptor._peripheral.emit('descriptorWrite', descriptor, written);
          descriptor.emit('descriptorWrite', written);
        }.bind(this))
      }
    }.bind(this));
  }

  BluetoothController.prototype.startNotifications = function(characteristic, callback) {
    this.writeToConfigDescriptorOfCharacteristic(characteristic, new Buffer([0x01, 0x00]), function(err) {
      callback && callback(err);
    });
  }

  BluetoothController.prototype.stopNotifications = function(characteristic, callback) {
    this.stopRemoteUpdates(characteristic, callback);
  }

  BluetoothController.prototype.startIndications = function(characteristic, callback) {
    this.writeToConfigDescriptorOfCharacteristic(characteristic, new Buffer([0x02, 0x00]), function(err) {
      callback && callback(err);
    });
  }

  BluetoothController.prototype.stopIndications = function(characteristic, callback) {
    this.stopRemoteUpdates(characteristic, callback);
  }

  BluetoothController.prototype.stopRemoteUpdates = function(characteristic, callback) {
    this.writeToConfigDescriptorOfCharacteristic(characteristic, new Buffer([0x00, 0x00]), function(err) {
      callback && callback(err);
    });
  }

  BluetoothController.prototype.writeToConfigDescriptorOfCharacteristic = function(characteristic, value, callback) {
    // Check if we've already fetched the config descriptor
    this.retrieveConfigDescriptor(characteristic, function(err, descriptor) {
      if (err) {
        return callback && callback(err);
      }
      else {
        if (!descriptor) {
          return callback && callback(new Error("Characteristic is not configured for notifications"));
        }
        else {
          descriptor.write(value, function(err, written) {
            return callback && callback(err);
          });
        }
      }
    });
  }
  BluetoothController.prototype.retrieveConfigDescriptor = function(characteristic, callback) {
    // Check if we've already fetched the config descriptor
    this.getConfigDescriptorFromFetched(characteristic, function(descriptor) {
      // If we haven't
      if (!descriptor) {
        // Discover all descriptors
        this.discoverDescriptorsOfCharacteristic(characteristic, function(err, descriptors) {
          if (err) {
            return callback && callback(err);
          }
          else {
            // Now check again for the config descriptor
            this.getConfigDescriptorFromFetched(characteristic, function(descriptor) {
              // If there is no descriptor, you can't get notifications from this char
              if (!descriptor) {
                return callback && callback();
              }
              else {
                return callback && callback(null, descriptor);
              }
            }.bind(this));
          }
        }.bind(this));
      }
      else {
        return callback && callback(null, descriptor);
      }
    }.bind(this));
  }

  BluetoothController.prototype.getConfigDescriptorFromFetched = function(characteristic, callback) {
    for (var d in characteristic.descriptors) {
      if (characteristic.descriptors[d].uuid.toString() == "2902") {
        return callback && callback(characteristic.descriptors[d]);
      }
    }
    callback && callback();
  }

  BluetoothController.prototype.confirmIndication = function(characteristic, callback) {
    this.messenger.confirmIndication(characteristic, function(err, response) {
      // If there was a problem with the request
      if (err) {

        // Call callback immediately
        callback && callback(err);

        // Emit the error
        setImmediate(function() {
          this.emit('error', err);
        }.bind(this))
      }
    }.bind(this));
  }

  BluetoothController.prototype.updateRssi = function(peripheral, callback) {
    this.messenger.updateRssi(peripheral, function(err, response) {

      callback && callback(err, response.rssi);

      if (!err) {
        setImmediate(function() {
          this.emit('rssiUpdate', response.rssi);
          peripheral.emit('rssiUpdate', response.rssi);
        }.bind(this));
      }
    }.bind(this));
  }

  // Returns a string... is that appropriate?
  BluetoothController.prototype.getBluetoothAddress = function(callback) {
    this.messenger.getAddress(function(err, response) {
      var address;
      if (response && !err) {
        address = Address.bufToStr(response.address);
      }
      callback && callback(err, address);
    });
  }

  BluetoothController.prototype.getMaxConnections = function(callback) {
    this.messenger.getMaxConnections(function(err, response) {
      callback && callback(err, response.maxconn);
    });
  }

  BluetoothController.prototype.startAdvertising = function(callback) {
    this.messenger.startAdvertising(function(err, response) {

      if (!err) {
        this.advertising = true;
        // Emit the error
        setImmediate(function() {
          this.emit('startAdvertising');
        }.bind(this));
      }
      else {
        this.advertising = false;
        // Emit the error
        setImmediate(function() {
          this.emit('error', err);
        }.bind(this));
      }

      // Call callback immediately
      callback && callback(err);

    }.bind(this));
  }

  BluetoothController.prototype.stopAdvertising = function(callback) {
    this.messenger.stopAdvertising(function(err, response) {
      if (!err) {
        this.advertising = false;
        // Emit the error
        setImmediate(function() {
          this.emit('stopAdvertising');
        }.bind(this));
      }
      else {
        this.advertising = true;
        // Emit the error
        setImmediate(function() {
          this.emit('error', err);
        }.bind(this));
      }

      // Call callback immediately
      callback && callback(err);

    }.bind(this));
  }

  BluetoothController.prototype.setAdvertisingData = function(data, callback) {
    this.advHelper(data, 0, callback);
  }

  BluetoothController.prototype.setScanResponseData = function(data, callback) {
    this.advHelper(data, 1, callback);
  }
  BluetoothController.prototype.advDataHelper = function(data, advParam, callback) {
    this.messenger.setAdvertisementData(advParam, data, function(err, response) {

      callback && callback(err);

      setImmediate(function() {
        this.emit('error');
      }.bind(this));

    }.bind(this));
  }

  BluetoothController.prototype.getFirmwareVersion = function(callback) {
    this.messenger.readLocalValue(this._firmwareVersionHandle, 0, function(err, response) {

      var version;
      if (response.value) {
        version = response.value.toString();
      }
      callback && callback(err, version);
    });
  }

  BluetoothController.prototype.maxNumValues = function(callback) {
    this.getFirmwareVersion(function(err, version) {
      var max;
      if (!err) {
        max = this._maxNumValues[version];
      }
      callback && callback(err, max);
    }.bind(this));
  }
  BluetoothController.prototype.readLocalValue = function(index, offset, callback) {
    this.messenger.readLocalValue(this._localHandles[index], offset, function(err, response) {
      callback && callback(err, response.value);
    });
  }
  BluetoothController.prototype.writeLocalValue = function(index, data, callback) {
    this.messenger.writeLocalValue(this._localHandles[index], data, function(err, response) {
      callback && callback(err);
    });
  }

  /*
  * HARDWARE
  */

  BluetoothController.prototype.I2C = function(address) {
    return new BluetoothI2C(this.messenger, address);
  }

  function BluetoothI2C(messenger, address) {
    this.messenger = messenger;
    this.address = address << 1;
  }

  BluetoothI2C.prototype.transfer = function(txbuf, rxLen, callback) {
    this.send(txbuf, function(err) {
      if (err) {
        return callback && callback(err);
      }
      else {
        this.receive(rxLen, function(err, rx) {
          return callback && callback(err, rx);
        });
      }
    }.bind(this));
  }

  BluetoothI2C.prototype.send = function(txbuf, callback) {
    // Send off the data
    // TODO: Let users decide on stop condition
    this.messenger.I2CSend(this.address, 1, txbuf, function(err, response) {

      // Return the error
      callback && callback(err);
    });
  }

  BluetoothI2C.prototype.receive = function(length, callback) {
    this.messenger.I2CRead(this.address, 1, length, function(err, response) {
      callback && callback(err, response.data);
    });
  }

  BluetoothController.prototype.gpio = function(index) {
    if (!this.gpios) {
      this.createGPIOs();
    }
    return this.gpios[index];
  }

  BluetoothController.prototype.createGPIOs = function() {
    this.gpios = {};
    this.gpios["p0_3"] = new BluetoothPin(this, 0, 3);
    this.gpios["p0_2"] = new BluetoothPin(this, 0, 2);
  }

  function BluetoothPin(controller, port, pin) {
    this._port = port;
    this._pin = pin;
    this._controller = controller;
    this.direction = "input";
    this.value = false;
    this.interruptOn = null;
  }

  util.inherits(BluetoothPin, events.EventEmitter);

  BluetoothPin.prototype.toString = function() {
    return JSON.stringify({
      direction: this.direction,
      value: this.value,
    });
  }
  BluetoothPin.prototype.setInput = function(callback) {
    this.direction = "input";
    this.setPinDirections(callback);
  }

  BluetoothPin.prototype.setOutput = function(initial, callback) {
    if (typeof initial == 'function') {
      next = initial;
      initial = null;
    }

    this.direction = "output";

    this.setPinDirections(function(err) {
      if (err) {
        return callback && callback(err);
      }
      else {
        this.write(initial, callback);
      }
    }.bind(this));
  }

  BluetoothPin.prototype.write = function(value, callback) {
    if (this.direction === "output") {

      this.value = value;

      this.setPinValues(value, callback);
    }
  }


  BluetoothPin.prototype.read = function(callback) {
    // Read port 0
    this._controller.messenger.readPin(this._port, 1 << this._pin, function(err, response) {
      var val;
      if (!err) {
        val = (response.data >> this._pin);
      }
      this.value = val;
      callback && callback(err, val);
    }.bind(this));
  }

  BluetoothPin.prototype.setPinDirections = function(callback) {

    var mask = 0;

    // Iterate through our gpios to construct a bitmask
    for (var id in this._controller.gpios) {
      // If the gpio is an output
      var gpio = this._controller.gpios[id];
      if (gpio.direction === "output") {
        // Put a one in it's place
        mask += (1 << gpio._pin);
      }
    }

    this._controller.messenger.setPinDirections(this._port, mask, function(err, response) {
      callback && callback(err);
    });
  }

  BluetoothPin.prototype.setPinValues = function(value, callback) {
    var mask = 0;
    var data = 0;

    // Iterate through our gpios to construct a bitmask
    for (var id in this._controller.gpios) {
      // If the gpio is an output
      var gpio = this._controller.gpios[id];
      if (gpio.direction === "output") {
        // Put a one in it's place
        mask += (1 << gpio._pin);
        // If the value is high
        if (gpio.value == true) {
          // Put a 1 in it's place
          data += (1 << gpio._pin);
        }
      }
    }

    this._controller.messenger.writePin(this._port, mask, data, function(err, response) {
        callback && callback(err);
    })
  }

  BluetoothPin.prototype.watch = function(type, callback) {

    if (type != "rise" && type != "fall" && type !="change") {
      return callback && callback(new Error("Invalid pin watch type. Must be 'rise', 'fall', or 'change'."));
    }

    // Set an event listener
    this.on(type, callback);

    // Set the type for the pin
    this.onInterrupt = type;

    this.setPinWatches(type, function(err) {
      if (err) {
        callback && callback(err);
      }
    }.bind(this));
  }

  BluetoothPin.prototype.unwatch = function(type, callback) {
    if (this.onInterrupt === type) {
      this.onInterrupt = null;
      this.setPinWatches(type, callback);
    }
    else {
      callback && callback();
    }
  }

  BluetoothPin.prototype.setPinWatches = function(type, callback) {

    var mask = 0;
    // For each of our gpios
    for (var id in this._controller.gpios) {
      // Get reference to gpio
      var gpio = this._controller.gpios[id];
      // If this interrupt type is the kind we are watching for
      if (gpio.onInterrupt == type) {
        // Add it to the mask
        mask += (1 << gpio._pin);
      }
    }

    // Tell the messenger to set the mask
    this._controller.messenger.watchPin(0, mask, (type === "rise" ? 0 : 1), function(err, response) {
      // If we're  looking for a change
      if (type === "change") {
        // We'll have to set the rise detector as well
        this._controller.messenger.watchPin(0, mask, 0, function(err, response) {
          callback && callback(err);
        });
      }
      else {
        callback && callback(err);
      }
    }.bind(this));
  }

  BluetoothController.prototype.readADC = function(callback) {
    this.once('ADCRead', function(adc) {
      /* From the datasheet:
      In the example case of 12 effective bits decimation, you will need to read
      the left-most 12 bits of the value to interpret it. It is a 12-bit 2's
      complement value left-aligned to the MSB of the 16-bit container.
      */
      var normalized = (adc.value >> 4) / 0x7ff;
      callback && callback(null, normalized);
    });
    // Read ADC channel 1, with the third option for decimation (12 value) with
    // aref as reference
    this.messenger.readADC(0x1, 0x3, 0x2, function(err, response) {

      // If there was a problem with the request
      if (err) {
        // Call callback immediately
        callback && callback(err);

        // Emit the error
        setImmediate(function() {
          this.emit('error', err);
        }.bind(this))
      }
    }.bind(this));
  }

  // Set whether a we can be bonded to
  BluetoothController.prototype.setBondable = function(bondable, callback) {
    this.messenger.setBondable(bondable ? 1 : 0, callback);
  }
  // Get bonds with current devices
  BluetoothController.prototype.getBonds = function(callback) {
    var bonds = [];
    var numBondsToSatisfy = 0;
    this.on('bondStatus', function bondStatus(status) {
      console.log("Got this buddy!", status);
      bonds.push(status);

      if (bonds.length === bumBondsToSatisfy) {
        this.removeListener('bondStatus', bondStatus);
        callback && callback(null, bonds);
      }
    }.bind(this));

    this.messenger.getBonds(function (err, response) {
      if (err) {
        callback && callback(err);
      }
      else if (response.bonds === 0) {
        callback && callback(null, bonds);
      }
      else {
        numBondsToSatisfy = response.bonds;
      }
    });
  }

  // Delete any bonds with devices
  BluetoothController.prototype.deleteBond = function(peripheral, callback) {
    this.messenger.deleteBond(peripheral, function(err) {
      if (!err) {
        peripheral.bondHandle = 0xff;
      }

      callback && callback(err);
    });
  }

  BluetoothController.prototype.startEncryption = function(peripheral, callback) {
    var self = this;

    function successHandler(status) {
      console.log("Got a connection status", status);
      if (status.connection === peripheral.connection) {
        peripheral.bondHandle = status.bonding;;
        removeHandlers();
        callback && callback(null, peripheral.bondHandle);
      }
    }

    function failHandler(failDetails) {
      console.log("Failure details", failDetails);
      if (peripheral.connection === failDetails.handle) {
        removeHandlers();
        callback && callback(failDetails.reason);
      }
    }

    function removeHandlers() {
      self.removeListener('connectionStatus', successHandler);
      self.removeListener('bondingFail', failHandler);
    }

    this.on('connectionStatus', successHandler);
    this.on('bondingFail', failHandler);

    this.messenger.startEncryption(peripheral, true, function(err, response) {
      if (err) {
        callback && callback(err);
      }
    });
  }

  BluetoothController.prototype.enterPasskey = function(peripheral, passKey, callback) {
    if (passKey < 0 || passkey > 999999) {
      return callback && callback(new Error("Passkey must be between 0 and 999999 inclusive."));
    }
    else {
      this.messenger.enterPasskey(peripheral, passKey, callback);
    }
  }

  BluetoothController.prototype.setEncryptionSize = function(size, callback) {
    // Enable/disable protection, set same key size, no smp io input/output
    if (size < 7 || size > 16) {
      return callback && callback(new Error("Invalid encryption key size. Must be between 7 and 16 bytes"));
    }
    else {
      this.messenger.setSecurityParameters(this._MITMEnabled, size, 3, function(err, response) {
        if (!err) {
          this._minKeySize = size;
        }

        callback && callback(err);
      });
    }
  }

  BluetoothController.prototype.setOOBData = function(data, callback) {
    if (!Buffer.isBuffer(data) || (data.length != 0 && data.length != 16)) {
      return callback && callback(new Error("OOB Data must be a buffer of 0 or 16 octets long"));
    }
    else {
      this.messenger.setOOBData(data, callback);
    }
  }

  BluetoothController.prototype.enableMITMProtection = function(enable, callback) {
    // Enable/disable protection, set same key size, no smp io input/output
    this.messenger.setSecurityParameters(enable ? 1 : 0, this._minKeySize, 3, function(err, response) {
      if (!err) {
        this._MITMEnabled = enable;
      }

      callback && callback(err);
    });
  }


  /*************************************************************
  PUBLIC API
  *************************************************************/
  module.exports.use = use;
  module.exports.BluetoothController = BluetoothController;
});

tap.ok(true, 'module code loaded');
