switch (1) {
  case 1:
    console.log('1. Should fallthrough now...');
  case true:
    console.log('definitely true');
    break;

  case false:
    console.log('this is wrong.');
    break;

  default:
    console.log('DEFAULT');
}