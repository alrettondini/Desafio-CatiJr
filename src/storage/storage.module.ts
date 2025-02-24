import { Module } from '@nestjs/common';
import { Storage } from './contracts/contract-storage';
import { LocalStorage } from './local-storage';

@Module({
  providers: [{ provide: Storage, useClass: LocalStorage }],
  exports: [Storage],
})
export class StorageModule {}
