import {
  Controller,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Post,
  Param,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileService } from '../../services/upload-file.service';
import { multerOptions } from 'src/storage/multer-options';
import {
  UploadFileParamSchema,
  uploadFileParamSchema,
} from '../schemas/task-schemas';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';

const paramValidationPipe = new ZodValidationPipe(uploadFileParamSchema);

@Controller('/tasks/:id/files')
export class UploadFileController {
  constructor(private uploadFileService: UploadFileService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async handle(
    @Param(paramValidationPipe) { id }: UploadFileParamSchema,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 100,
            message: 'Max file size: 100MB',
          }),
        ],
      }),
    )
    { filename }: Express.Multer.File,
  ) {
    const { file } = await this.uploadFileService.execute({
      path: filename,
      taskId: id,
    });

    return {
      file,
    };
  }
}
