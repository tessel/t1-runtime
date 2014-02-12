#include <stdint.h>
#include <stddef.h>
#include <string.h>

static int _footsize (uint8_t* ptr, int max) {
  return 0;
  // int j = 0, ma = 0, k = 0, l = 0, i = 0;
  // for (i = 0; i < max; i++) {
  //   if (ptr[i] != 0) {
  //     if (k == 0) {
  //       l = i;
  //     }
  //     k = 1;
  //     j = -1;
  //   } else {
  //     if (k == 1) {
  //       j = i;
  //     }
  //     k = 0;
  //   }
  // }
  // printf("--> foot size %d\n", max-l);
  // return max-l;
}

static int _datasize (uint8_t* ptr, int max) {
  return max;
  // int j = 0, ma = 0, k = 1, l = 0, i = 0;
  // int footsize = _footsize(ptr, max);
  // for (i = 0; i < max-footsize; i++) {
  //   if (ptr[i] != 0) {
  //     k = 1;
  //   } else {
  //     if (k == 1) {
  //     	j = i;
  //     }
  //     k = 0;
  //   }
  // }
  // printf("--> data size %d\n", j);
  // return j;
}

size_t dlmallocfork_save_size (void* _ptr, int max)
{
	uint8_t* ptr = (uint8_t*) _ptr;
	return 4 + _datasize(ptr, max) + _footsize(ptr, max);
}

void dlmallocfork_save (void* _source, int source_max, void* _target, int target_max)
{
	uint8_t* source = (uint8_t*) _source;
	uint8_t* target = (uint8_t*) _target;

  int TOP_FOOT_SIZE = _footsize(source, source_max);

  int i = 0;
  int datalen = _datasize(source, source_max);
  target[0] = (datalen >> 24) & 0xFF;
  target[1] = (datalen >> 16) & 0xFF;
  target[2] = (datalen >> 8) & 0xFF;
  target[3] = (datalen >> 0) & 0xFF;
  // printf("write %d (%x %x)\n", datalen, target[0], target[1]);
  memcpy(&target[4], source, target_max-(4+TOP_FOOT_SIZE));
  memcpy(&target[target_max-TOP_FOOT_SIZE], &source[source_max - (TOP_FOOT_SIZE - i)], TOP_FOOT_SIZE);
}

void dlmallocfork_restore (void* _source, int source_max, void* _target, int target_max)
{
	uint8_t* source = (uint8_t*) _source;
	uint8_t* target = (uint8_t*) _target;


  int datalen = (target[0] << 24) | (target[1] << 16) | (target[2] << 8) | (target[3] << 0);
  // printf("loading %d bytes (%x %x)\n", datalen, target[0], target[1]);
  memcpy(source, &target[4], datalen);
  memcpy(&source[source_max - (target_max - (datalen+4))], &target[datalen+4], target_max - (datalen+4));
}