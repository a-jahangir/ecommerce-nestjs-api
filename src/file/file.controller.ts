import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UploadFileDto } from "./dto/upload.file.dto";
import { UserAuthGuard } from "../user/auth/Guard/user.guard";
import { UserExpressRequest } from "../user/auth/types/user-express-request";
import { checkImageFile, editUUIDFileName } from "../shared/filter/upload.file.filter";
import { AdminAuthGuard } from "src/admin/auth/Guard/admin.guard";

@Controller("files")
@ApiTags("File-Upload")
export class FileController {
  @Post("user/files")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Upload File Documents",
    type: UploadFileDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "file", maxCount: 1 }], {
      storage: diskStorage({
        destination: "./public",
        filename: editUUIDFileName,
      }),
      limits: { fileSize: 100 * 1024 * 1024 },
    })
  )
  @UseGuards(UserAuthGuard)
  async uploadFileUser(@Req() req: UserExpressRequest, @UploadedFiles() files: any[], @Body() data: UploadFileDto) {
    if (files && files["file"]) {
      checkImageFile(files["file"][0].originalname);
      data.file = files["file"][0].filename;
    } else throw new NotFoundException();

    return {
      data: {
        fileInfo: {
          fileTarget: data.FileTarget,
          filePath: data.file,
        },
      },
    };
  }

  @Post("admin/files")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Upload File Documents",
    type: UploadFileDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "file", maxCount: 1 }], {
      storage: diskStorage({
        destination: "./public",
        filename: editUUIDFileName,
      }),
      limits: { fileSize: 100 * 1024 * 1024 },
    })
  )
  @UseGuards(AdminAuthGuard)
  async uploadFileAdmin(@Req() req: UserExpressRequest, @UploadedFiles() files: any[], @Body() data: UploadFileDto) {
    if (files && files["file"]) {
      checkImageFile(files["file"][0].originalname);
      data.file = files["file"][0].filename;
    } else throw new NotFoundException();

    return {
      data: {
        fileInfo: {
          fileTarget: data.FileTarget,
          filePath: data.file,
        },
      },
    };
  }
}
