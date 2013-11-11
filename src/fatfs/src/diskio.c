/*-----------------------------------------------------------------------*/
/* Low level disk I/O module skeleton for FatFs     (C)ChaN, 2013        */
/*-----------------------------------------------------------------------*/
/* If a working storage control module is available, it should be        */
/* attached to the FatFs via a glue function rather than modifying it.   */
/* This is an example of glue functions to attach various exsisting      */
/* storage control module to the FatFs module with a defined API.        */
/*-----------------------------------------------------------------------*/

#include "diskio.h"		/* FatFs lower layer API */

#include <stdint.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

/* Definitions of physical drive number for each media */
#define ATA		0


#define DISKSIZE 1024

/*-----------------------------------------------------------------------*/
/* Inidialize a Drive                                                    */
/*-----------------------------------------------------------------------*/

// uint8_t *thisisadrive = (uint8_t *) 0x28000000;
uint8_t thisisadrive[512*DISKSIZE] = { 0 };

DSTATUS disk_initialize (
	BYTE pdrv				/* Physical drive nmuber (0..) */
)
{
	DSTATUS stat;
	int result;

	switch (pdrv) {
	case ATA :
		// result = ATA_disk_initialize();
		// fd = open("/Users/tim/Code/technical/jolony/runtime/etc/test.img", O_RDONLY);
//		if (thisisadrive == NULL) {
//			thisisadrive = (uint8_t*) malloc(512 * DISKSIZE);
//		}
		stat = disk_status(pdrv);

		// translate the reslut code here

		return stat;
	}
	return STA_NOINIT;
}



/*-----------------------------------------------------------------------*/
/* Get Disk Status                                                       */
/*-----------------------------------------------------------------------*/

DSTATUS disk_status (
	BYTE pdrv		/* Physical drive nmuber (0..) */
)
{
	DSTATUS stat;
	int result;

	switch (pdrv) {
	case ATA :
		stat = 0;
		// stat = fd == -1 ? STA_NOINIT : 0;

		// translate the reslut code here

		return stat;
	}
	return STA_NOINIT;
}



/*-----------------------------------------------------------------------*/
/* Read Sector(s)                                                        */
/*-----------------------------------------------------------------------*/

DRESULT disk_read (
	BYTE pdrv,		/* Physical drive nmuber (0..) */
	BYTE *buff,		/* Data buffer to store read data */
	DWORD sector,	/* Sector address (LBA) */
	UINT count		/* Number of sectors to read (1..128) */
)
{
	DRESULT res;
	int result;

	switch (pdrv) {
	case ATA :
		// translate the arguments here

		if ((sector + count) > DISKSIZE) {
			res = RES_PARERR;
		} else {
			memcpy(buff, &thisisadrive[(sector) * 512], count * 512);
			res = 0;
		}
		// lseek(fd, sector * 512, SEEK_SET);
		// read(fd, buff, count * 512);
		

		// translate the resulting code here
		return res;
	}
	return RES_PARERR;
}



/*-----------------------------------------------------------------------*/
/* Write Sector(s)                                                       */
/*-----------------------------------------------------------------------*/

#if _USE_WRITE
DRESULT disk_write (
	BYTE pdrv,			/* Physical drive nmuber (0..) */
	const BYTE *buff,	/* Data to be written */
	DWORD sector,		/* Sector address (LBA) */
	UINT count			/* Number of sectors to write (1..128) */
)
{
	DRESULT res;
	int result;

	switch (pdrv) {
	case ATA :
		// translate the arguments here

		// result = ATA_disk_write(buff, sector, count);
		if ((sector + count) > DISKSIZE) {
			res = RES_PARERR;
		} else {
			// printf("ok %d %d %d, %d %p\n", sector, (sector-1) * 512, count * 512, sizeof(thisisadrive), buff);
			memcpy(&thisisadrive[(sector) * 512], buff, count * 512);
			// printf("--> done.\n");
			res = 0;
		}

		// translate the reslut code here

		return res;
	}
	return RES_PARERR;
}
#endif


/*-----------------------------------------------------------------------*/
/* Miscellaneous Functions                                               */
/*-----------------------------------------------------------------------*/

#if _USE_IOCTL
DRESULT disk_ioctl (
	BYTE pdrv,		/* Physical drive nmuber (0..) */
	BYTE cmd,		/* Control code */
	void *buff		/* Buffer to send/receive control data */
)
{
	DRESULT res;
	int result;

	switch (pdrv) {
	case ATA :
		// pre-process here
		switch (cmd) {
			case CTRL_SYNC: //	Make sure that the disk drive has finished pending write process. When the disk I/O module has a write back cache, flush the dirty sector immediately. This command is not used in read-only configuration.
							// NOOP
				res = RES_OK;
				break;
			case GET_SECTOR_COUNT:	// Returns number of available sectors on the drive into the DWORD variable pointed by buff. This command is used by only f_mkfs() function to determine the volume size to be created.
				*(DWORD*)buff = DISKSIZE;
				res = RES_OK;
				break;
			case GET_SECTOR_SIZE:	// Returns sector size of the drive into the WORD variable pointed by buff. This command is not used in fixed sector size configuration, _MAX_SS is 512.
				*(WORD*)buff = 512;
				res = RES_OK;
				break;
			case GET_BLOCK_SIZE:	// Returns erase block size of the flash memory in unit of sector into the DWORD variable pointed by buff. The allowable value is 1 to 32768 in power of 2. Return 1 if the erase block size is unknown or disk devices. This command is used by only f_mkfs() function and it attempts to align data area to the erase block boundary.
				*(DWORD*)buff = 128;
				res = RES_OK;
				break;
			case CTRL_ERASE_SECTOR:
				res = RES_OK;
				break;
			default:
				res = RES_ERROR;
		}

		// post-process here

		return res;
	}
	return RES_PARERR;
}
#endif

DWORD get_fattime (void)
{
	return 0;
}
