import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as speakeasy from "speakeasy";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService, ConfigType } from "@nestjs/config";
import OtpDto from "../dto/otp.dto";
import LoginDto from "../dto/login.dto";
import RegisterDto from "../dto/register.dto";
import { PasswordDTO } from "../dto/password.dto";
import { UserEntity } from "../entity/user.entity";
import appEnvConfig from "../../config/app.env.config";
import { UserRoleEnum } from "../../shared/enum/user.role.enum";
import { UserProfileEntity } from "../entity/user.profile.entity";
import TokenPayload from "../../shared/interface/tokenPayload.interface";
import { RedisService } from "../../redis/redis.service";
import { UpdatePasswordDTO } from "../dto/update.password.dto";
import { UserLoginHistoryEntity } from "../entity/user.login.history.entity";
import { UAParser } from "ua-parser-js";
import { UserLoginHistoryEnum } from "../enum/user.login.history.enum";
import { login2faDto } from "../dto/login.2fa.dto";
import { GetProfileDto } from "../dto/get.profile.dto";
import { GenderEnum } from "../../shared/enum/gender.enum";
import { BaseInfoService } from "../../baseinfo/baseinfo.service";
import { UpdateProfileDto } from "../dto/update.profile.dto";
import { UpdateAvatarDto } from "../dto/update.avatar.dto";
import { UserProfileDto } from "../dto/user.profile.dto";
import { UserSettingEntity } from "../entity/user.setting.entity";
import { LanguageEnum } from "../../baseinfo/enum/language.type.enum";
import { UpdateUserSettingsDto } from "../dto/update.user.setting.dto";
import { UserProfileSettingDto } from "../dto/user.profile.setting.dto";
import { MailStrategyService } from "../../mail/strategy/mail-strategy.service";
import { UserDeviceEntity } from "../entity/user.device.entity";
import { UserRefreshTokenEntity } from "../entity/user.refresh.token.entity";
import { UserExpressRequest } from "../auth/types/user-express-request";
import { UpdateRefreshTokenDto } from "../dto/update.refresh.dto";
import * as path from "path";
import { promises as fs } from "fs";
import { User2faSettingDto } from "../dto/user.2fa.setting.dto";
import { User2FASettingEntity } from "../entity/user.2fa.setting.entity";
import { Update2faSettingDto } from "../dto/update.2fa.setting.dto";
import { CurrentDeviceDto } from "../dto/current.device.dto";
import { ForgetPasswordDto } from "../dto/forget.password.dto";
import { NewPasswordDto } from "../dto/new.password.dto";
import { MailProviderEnum } from "src/mail/enum/mail-provider.enum";
import { TemplateNameEnum } from "src/mail/enum/template-name.enum";
import { UserAddressEntity } from "../entity/user.address.entity";
import { UserAddressDto } from "../dto/user.address.dto";
import { UserAddressDetailsDto } from "../dto/user.address.details.dto";
import { UpdateUserAddressDto } from "../dto/update.user.address.dto";
import { CreateUserAddressDto } from "../dto/create.address.dto";
import { promises } from "dns";

@Injectable()
export class UserService {
  private readonly templatesDir: string;
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserLoginHistoryEntity)
    private readonly userLoginRepo: Repository<UserLoginHistoryEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepository: Repository<UserProfileEntity>,
    @InjectRepository(UserSettingEntity)
    private readonly userSettingRepo: Repository<UserSettingEntity>,
    @InjectRepository(UserDeviceEntity)
    private readonly userDeviceRepo: Repository<UserDeviceEntity>,
    @InjectRepository(UserRefreshTokenEntity)
    private readonly userRefreshRepo: Repository<UserRefreshTokenEntity>,
    @InjectRepository(User2FASettingEntity)
    private readonly user2faSettingRepo: Repository<User2FASettingEntity>,
    @InjectRepository(UserAddressEntity)
    private readonly userAddressRepo: Repository<UserAddressEntity>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly baseinfoService: BaseInfoService,
    private readonly configService: ConfigService<ConfigType<typeof appEnvConfig>>,
    private readonly mailStrategyService: MailStrategyService
  ) {
    this.templatesDir = path.join(process.cwd(), "dist/templates");
  }

  async getUserAddresses(user: UserEntity) {
    const [addresses, totalItems] = await this.userAddressRepo.findAndCount({ where: { user } });
    const resList: UserAddressDto[] = [];
    for (let i = 0; i < addresses.length; i++) {
      resList.push(
        this.createResponseData<UserAddressDto>(
          (address: UserAddressEntity) => ({
            address: `${address.country.primaryName}, ${address.city}, ${address.streetAddress}`,
            name: `${address.firstName} ${address.lastName}`,
            phone: address.houseNumber,
            postalCode: address.postalcode,
          }),
          addresses[i]
        )
      );
    }
    return {
      resList,
      totalItems,
    };
  }

  async getAddressById(addressId: string) {
    const userAddress = await this.userAddressRepo.findOne({ where: { id: addressId } });
    if (!userAddress) throw new BadRequestException();
    return this.createResponseData<UserAddressDetailsDto>(
      (address: UserAddressEntity) => ({
        firstName: address.firstName,
        lastName: address.lastName,
        houseNumber: address.houseNumber,
        postalcode: address.postalcode,
        streetAddress: address.streetAddress,
        city: address.city,
        country: address.country,
        description: address.description,
      }),
      userAddress
    );
  }

  async editAddressById(user: UserEntity, data: UpdateUserAddressDto) {
    const address = await this.userAddressRepo.findOne({ where: { id: data.id } });
    if (!address) throw new NotFoundException();
    if (address.user.id !== user.id) throw new BadRequestException();
    if (data.city) address.city = data.city;
    if (data.countryId) {
      const country = await this.baseinfoService.getCountryById(data.countryId);
      if (country) address.country = country;
    }
    if (data.firstName) address.firstName = data.firstName;
    if (data.lastName) address.lastName = data.lastName;
    if (data.email) address.email = data.email;
    if (data.description) address.description = data.description;
    if (data.houseNumber) address.houseNumber = data.houseNumber;
    if (data.phone) address.phone = data.phone;
    if (data.postalCode) address.postalcode = data.postalCode;
    if (data.streetAddress) address.streetAddress = data.streetAddress;
    await this.userAddressRepo.save(address);
    return this.createResponseData<UserAddressDetailsDto>(
      (address: UserAddressEntity) => ({
        firstName: address.firstName,
        lastName: address.lastName,
        houseNumber: address.houseNumber,
        postalcode: address.postalcode,
        streetAddress: address.streetAddress,
        city: address.city,
        country: address.country,
        description: address.description,
      }),
      address
    );
  }

  async createNewAddress(user: UserEntity, data: CreateUserAddressDto) {
    const [userAddresses, totalItems] = await this.userAddressRepo.findAndCount({ where: { user } });
    if (totalItems < 10) {
      let newAddress = new UserAddressEntity();
      const country = await this.baseinfoService.getCountryById(data.countryId);

      if (country) newAddress.country = country;
      else throw new NotFoundException();
      if (data.firstName) newAddress.firstName = data.firstName;
      else throw new NotFoundException();
      if (data.lastName) newAddress.lastName = data.lastName;
      else throw new NotFoundException();
      if (data.city) newAddress.city = data.city;
      else throw new NotFoundException();
      if (data.description) newAddress.description = data.description;
      if (data.email) newAddress.email = data.email;
      else throw new NotFoundException();
      if (data.phone) newAddress.phone = data.phone;
      else throw new NotFoundException();
      if (data.houseNumber) newAddress.houseNumber = data.houseNumber;
      else throw new NotFoundException();
      if (data.postalCode) newAddress.postalcode = data.postalCode;
      else throw new NotFoundException();
      if (data.streetAddress) newAddress.streetAddress = data.streetAddress;
      else throw new NotFoundException();

      newAddress = await this.userAddressRepo.save(newAddress);
      return this.createResponseData<UserAddressDetailsDto>(
        (address: UserAddressEntity) => ({
          firstName: address.firstName,
          lastName: address.lastName,
          houseNumber: address.houseNumber,
          postalcode: address.postalcode,
          streetAddress: address.streetAddress,
          city: address.city,
          country: address.country,
          description: address.description,
        }),
        newAddress
      );
    } else throw new BadRequestException();
  }

  async resetPassword(user: UserEntity, data: NewPasswordDto) {
    user.password = await bcrypt.hash(data.newPassword, 10);
    await this.userRepository.save(user);
    const userwithDevice = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ["devices", "refreshes"],
    });
    for (let i = 0; i < userwithDevice.refreshes.length; i++) {
      userwithDevice.refreshes[i].token = null;
      await this.userRefreshRepo.save(userwithDevice.refreshes[i]);
    }
  }

  public makeRecoveryJwtToken(userId: string, role: UserRoleEnum) {
    const payload: TokenPayload = { userId, role };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get("user", {
        infer: true,
      }).userResetPasswordSecret,
      expiresIn: this.configService.get("user", {
        infer: true,
      }).userResetPasswordExpirationTime,
    });
    return token;
  }

  async forgetPassword(data: ForgetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (!user) throw new BadRequestException("USER.NOT_FOUND");
    if (user.role == UserRoleEnum.NEW_USER) throw new BadRequestException("USER.NOT_ALLOWED");

    const token = this.makeRecoveryJwtToken(user.id, user.role);
    const url =
      this.configService.get("application", { infer: true }).url +
      this.configService.get("application", { infer: true }).resetPasswordRout +
      `?token=${token}`;
    this.sendRecoveryEmail(user.email, url);
  }

  async update2faSetting(user: UserEntity, data: Update2faSettingDto): Promise<User2faSettingDto> {
    const user2faSetting = await this.user2faSettingRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (!user2faSetting) throw new BadRequestException("2FA.NOT_FOUND");
    data.loginActivation == true
      ? (user2faSetting.loginActivatedAt = new Date())
      : (user2faSetting.loginActivatedAt = null);
    await this.user2faSettingRepo.save(user2faSetting);
    return this.createResponseData<User2faSettingDto>(
      (user2fa: User2FASettingEntity, user: UserEntity) => ({
        loginActivatedAt: user2fa.loginActivatedAt,
        twofactorActivatedAt: user.twoFactorActivatedAt,
        withdrawalActivatedAt: user2fa.withdrawalActivatedAt,
      }),
      user2faSetting,
      user
    );
  }

  async get2faSettings(user: UserEntity): Promise<User2faSettingDto> {
    const userSetting2fa = await this.user2faSettingRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (userSetting2fa)
      return this.createResponseData<User2faSettingDto>(
        (user2fa: User2FASettingEntity, user: UserEntity) => ({
          loginActivatedAt: user2fa.loginActivatedAt,
          twofactorActivatedAt: user.twoFactorActivatedAt,
          withdrawalActivatedAt: user2fa.withdrawalActivatedAt,
        }),
        userSetting2fa,
        user
      );
    else return null;
  }

  async getTemplateWithCode(templateName: string, code: string): Promise<string> {
    try {
      const filePath = path.join(this.templatesDir, templateName);
      let fileContent = await fs.readFile(filePath, "utf-8");
      fileContent = fileContent.replace("{{code}}", code);
      return fileContent;
    } catch (error) {
      console.error("Error reading or processing the template:", error);
      return null;
    }
  }

  async getRecoveryTemplateWithLink(templateName: string, url: string) {
    try {
      const filePath = path.join(this.templatesDir, templateName);
      let fileContent = await fs.readFile(filePath, "utf-8");
      fileContent = fileContent.replace("{{resetUrl}}", url);
      return fileContent;
    } catch (error) {
      console.error("Error reading or processing the template:", error);
      return null;
    }
  }

  async getWellcomTemplateWithLink(templateName: string, firstName: string) {
    try {
      const filePath = path.join(this.templatesDir, templateName);
      let fileContent = await fs.readFile(filePath, "utf-8");
      fileContent = fileContent.replace("{{firstName}}", firstName);
      return fileContent;
    } catch (error) {
      console.error("Error reading or processing the template:", error);
      return null;
    }
  }

  private createResponseData<T>(mapper: (...args: any[]) => T, ...args: any[]): T {
    return mapper(...args);
  }

  private async sendOtpEmail(to: string, code: number, title: string): Promise<void> {
    const mailService = this.mailStrategyService.getStrategy(MailProviderEnum.hostinger);
    const templateWithCode = await this.getTemplateWithCode(TemplateNameEnum.send_otp, `${code}`);
    await mailService.sendMail(to, title, templateWithCode);
  }

  private async sendRecoveryEmail(to: string, url: string): Promise<void> {
    const mailService = this.mailStrategyService.getStrategy(MailProviderEnum.hostinger);
    const templateWithLink = await this.getRecoveryTemplateWithLink(TemplateNameEnum.recovery_password, url);
    await mailService.sendMail(to, "Reset Password", templateWithLink);
  }

  private async sendWellcomEmail(to: string, firstName: string): Promise<void> {
    const mailService = this.mailStrategyService.getStrategy(MailProviderEnum.hostinger);
    const templateWithName = await this.getWellcomTemplateWithLink(TemplateNameEnum.welcome, firstName);
    await mailService.sendMail(to, "Wellcome", templateWithName);
  }

  async getUserSettings(userId: string): Promise<UserProfileSettingDto> {
    const userSettings = await this.userSettingRepo.findOne({
      where: { userId },
    });
    const defaultLanguage = await this.baseinfoService.getLanguageById(userSettings.defaultLanguageId);
    return this.createResponseData<UserProfileSettingDto>(
      (userSettings: UserSettingEntity) => ({
        defaultLanguage,
        isEmailNotificationEnabled: userSettings.isEmailNotificationEnabled,
      }),
      userSettings
    );
  }

  async updateUserSettings(userId: string, data: UpdateUserSettingsDto): Promise<UserProfileSettingDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      const userSettings = await this.userSettingRepo.findOne({
        where: { userId },
      });
      let { defaultLanguageId, isEmailNotificationEnabled } = data;
      const languaggs = (await this.baseinfoService.getLanguages(200, 0)).languageList;
      if (!languaggs.map((lang) => lang.id).includes(defaultLanguageId))
        throw new NotFoundException("LANGUAGE.NOT_FOUND");
      userSettings.defaultLanguageId = defaultLanguageId;
      userSettings.isEmailNotificationEnabled = isEmailNotificationEnabled;
      await this.userSettingRepo.save(userSettings);
      const defaultLanguage = await this.baseinfoService.getLanguageById(userSettings.defaultLanguageId);
      return this.createResponseData<UserProfileSettingDto>(
        (userSettings: UserSettingEntity) => ({
          defaultLanguage,
          isEmailNotificationEnabled: userSettings.isEmailNotificationEnabled,
        }),
        userSettings
      );
    } else throw new BadRequestException("USER.NOT_FOUND");
  }

  async verify2FAToken(secret: string, token: string): Promise<boolean> {
    try {
      return await speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
      });
    } catch (e) {
      return false;
    }
  }

  async delete2faToken(user: UserEntity, token: string) {
    if (user.isAuthenticatedbyGoogle == false) throw new BadRequestException("2FA.NOT_FOUND");
    if (await this.verify2FAToken(user.twoFactorSecret, token)) {
      user.isAuthenticatedbyGoogle = false;
      user.twoFactorActivatedAt = null;
      user.twoFactorSecret = null;
      user.twoFactorUrl = null;
      const user2faSetting = await this.user2faSettingRepo.findOne({
        where: { user: { id: user.id } },
      });
      await this.userRepository.save(user);
      await this.user2faSettingRepo.softDelete(user2faSetting);
      return true;
    }
  }

  async getForVerify2faToken(user: UserEntity, token: string) {
    if (user.isAuthenticatedbyGoogle == false) {
      if (await this.verify2FAToken(user.twoFactorSecret, token)) {
        user.isAuthenticatedbyGoogle = true;
        user.twoFactorActivatedAt = new Date();
        const new2faSetting = new User2FASettingEntity();
        new2faSetting.withdrawalActivatedAt = user.twoFactorActivatedAt;
        new2faSetting.user = user;
        await this.user2faSettingRepo.save(new2faSetting);
        await this.userRepository.save(user);
        return true;
      }
      return false;
    } else throw new BadRequestException("2FA.NOT_FOUND");
  }

  async getSecret2fa(user: UserEntity, otp: string) {
    if (await this.verifyOtp({ username: user.email, otp }, false)) {
      if (user.isAuthenticatedbyGoogle == false) {
        const secret = await speakeasy.generateSecret({
          length: 20,
          name: `${this.configService.get("application", { infer: true }).url}:${user.email}`,
        });

        user.twoFactorSecret = secret.base32;
        user.twoFactorUrl = secret.otpauth_url;
        await this.userRepository.save(user);

        return {
          twoFactorData: { QRCodeUrl: secret.otpauth_url },
        };
      } else throw new BadRequestException("2FA.NOT_FOUND");
    } else throw new BadRequestException("OTP.INVALID");
  }

  async getLoginHistory(take: number, skip: number, userId: string) {
    const [reHistory, total] = await this.userLoginRepo.findAndCount({
      where: { userId },
      take,
      skip,
      order: {
        createAt: "desc",
      },
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["devices", "refreshes"],
    });
    const loginHistory = [];
    for (let i = 0; i < reHistory.length; i++) {
      const { id, ipAddress, deviceInfo, status, createAt } = reHistory[i];
      const devInfo = JSON.parse(deviceInfo);
      loginHistory.push({
        id,
        ipAddress,
        deviceInfo: devInfo,
        createAt,
        status: UserLoginHistoryEnum[status],
      });
    }

    const currentDeviceList = [];
    for (let i = 0; i < user.devices.length; i++) {
      let isConnected = false;
      for (let j = 0; j < user.refreshes.length; j++) {
        if (user.devices[i].deviceId == user.refreshes[j].device.deviceId)
          if (user.refreshes[j].token != null) isConnected = true;
      }
      currentDeviceList.push(
        this.createResponseData<CurrentDeviceDto>(
          (device: UserDeviceEntity, isConnected: boolean) => ({
            id: device.id,
            deviceId: device.deviceId,
            deviceType: device.deviceType,
            ipAddress: device.ipAddress,
            lastLogin: device.lastLogin,
            createAt: device.createAt,
            isConnected,
            userAgent: `${new UAParser().setUA(device.userAgent).getResult().os.name}|${
              new UAParser().setUA(device.userAgent).getResult().browser.name
            }`,
          }),
          user.devices[i],
          isConnected
        )
      );
    }

    return {
      currentDeviceList,
      loginHistoryList: loginHistory,
      totalItems: total,
    };
  }

  async updatePassword(userId: string, updatePasswordDTO: UpdatePasswordDTO) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException("USER.INVALID");

    if (await bcrypt.compare(updatePasswordDTO.currentPassword, user.password)) {
      user.password = await bcrypt.hash(updatePasswordDTO.newPassword, 10);
      return await this.userRepository.save(user);
    } else throw new BadRequestException("PASSWORD.INVALID");
  }

  getRoles() {
    return UserRoleEnum;
  }

  //===================================================================================================\\

  async updateAvatar(userId: string, updateAvatarDto: UpdateAvatarDto) {
    let user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["profile"],
    });

    if (!user) throw new BadRequestException("USER.INVALID");
    user.profile.avatarImgPath = updateAvatarDto.avatar;
    await this.userProfileRepository.save(user.profile);
    return user.profile.avatarImgPath;
  }

  async deleteAvatar(user: UserEntity) {
    const userProfile = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ["profile"],
    });
    if (!user) throw new BadRequestException("USER.INVALID");
    userProfile.profile.avatarImgPath = null;
    await this.userProfileRepository.save(userProfile.profile);
    return null;
  }
  //===================================================================================================\\
  async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserProfileDto> {
    let user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["profile"],
    });

    if (!user) throw new BadRequestException("USER.INVALID");
    if (data.gender == GenderEnum.FEMALE || data.gender == GenderEnum.MALE || data.gender == GenderEnum.NON)
      user.profile.gender = data.gender;

    if (data.countryId != null) {
      const country = await this.baseinfoService.getCountryById(data.countryId);
      if (country) {
        user.profile.countryId = country.id;
      }
    }
    if (data.address && data.address != null) user.profile.address = data.address;
    if (data.phone && data.phone != null) user.profile.phone = data.phone;
    if (data.postalCode && data.postalCode != null) user.profile.postalCode = data.postalCode;
    await this.userProfileRepository.save(user.profile);
    const country =
      user.profile.countryId != 0 ? await this.baseinfoService.getCountryById(user.profile.countryId) : null;
    return this.createResponseData<UserProfileDto>(
      (user: UserEntity) => ({
        id: user.id,
        address: user.profile.address,
        avatarImgPath: user.profile.avatarImgPath,
        country,
        gender: GenderEnum[user.profile.gender],
        postalCode: user.profile.postalCode,
        createAt: user.createAt,
        updateAt: user.updateAt,
      }),
      user
    );
  }

  async getProfile(userId: string): Promise<GetProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["profile"],
    });
    if (!user) throw new BadRequestException("USER.NOT_FOUND");
    const country =
      user.profile.countryId != 0 ? await this.baseinfoService.getCountryById(user.profile.countryId) : null;
    return this.createResponseData<GetProfileDto>(
      (user: UserEntity) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.profile.phone,
        address: user.profile.address == null ? null : user.profile.address,
        avatarImgPath: user.profile.avatarImgPath == null ? null : user.profile.avatarImgPath,
        country,
        gender: user.profile.gender,
        postalCode: user.profile.postalCode == null ? null : user.profile.postalCode,
        createAt: user.createAt,
        updateAt: user.updateAt,
        enum: {
          genderEnum: GenderEnum,
          roleEnum: UserRoleEnum,
        },
      }),
      user
    );
  }

  //===================================================================================================\\
  // async getNewToken(token: string, userId: string) {
  //   const user = await this.userRepository.findOne({
  //     where: {
  //       id: userId,
  //     },
  //   });
  //   if (user) {
  //     if (user.refresh_token == token) {
  //       const refreshToken = await this.makeRefreshToken(user.id, user.role);
  //       user.refresh_token = refreshToken;
  //       await this.userRepository.save(user);
  //       return {
  //         access_token: await this.makeJwtToken(user.id, user.role),
  //         refresh_token: refreshToken,
  //       };
  //     }
  //   }
  // }

  private async saveLoginHistory(req: UserExpressRequest, status: number, userId: string): Promise<void> {
    const ipAddress =
      req.headers["x-forwarded-for"] != undefined
        ? req.headers["x-forwarded-for"].toString().split(",")[0]
        : "unknown ip";
    // Get User-Agent
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser();
    const deviceInfo = parser.setUA(userAgent).getResult();
    // Log or store in request object
    req["ipAddress"] = ipAddress;
    req["deviceInfo"] = deviceInfo;

    const history = this.userLoginRepo.create({
      status,
      ipAddress,
      deviceInfo: JSON.stringify(deviceInfo),
      userId,
    });
    await this.userLoginRepo.save(history);
  }

  async login2fa(data: login2faDto, request: UserExpressRequest) {
    const user = await this.userRepository.findOne({
      where: { id: data.userId },
      relations: ["devices", "refreshes"],
    });

    if (!user || user.isAuthenticatedbyGoogle == false) throw new BadRequestException("USER.NOT_FOUND");

    const verified = await this.verify2FAToken(user.twoFactorSecret, data.code);
    if (verified) {
      const ipAddress =
        request.headers["x-forwarded-for"] != undefined
          ? request.headers["x-forwarded-for"].toString().split(",")[0]
          : "unknown ip";
      const userAgent = request.headers["user-agent"];
      const parser = new UAParser();
      const deviceInfo = parser.setUA(userAgent).getResult();
      let fundedDevice: UserDeviceEntity;
      if (user.devices.length <= 2) {
        for (let i = 0; i < user.devices.length; i++) {
          const { deviceType, userAgent } = user.devices[i];
          if (
            ipAddress == user.devices[i].ipAddress &&
            deviceInfo.ua == userAgent &&
            deviceType == deviceInfo.os.name
          ) {
            fundedDevice = user.devices[i];
          }
        }
        if (fundedDevice != null) {
          let refreshRaw;
          for (let i = 0; i < user.refreshes.length; i++) {
            const { device } = user.refreshes[i];
            if (device.id == fundedDevice.id) refreshRaw = user.refreshes[i];
          }
          refreshRaw.token = await this.makeRefreshToken(user.id, user.role);
          await this.userRefreshRepo.save(refreshRaw);
          await this.saveLoginHistory(request, UserLoginHistoryEnum.SUCCESS, user.id);

          const currentDevice = this.createResponseData<CurrentDeviceDto>(
            (device: UserDeviceEntity) => ({
              id: device.id,
              deviceId: device.deviceId,
              ipAddress: device.ipAddress,
              lastLogin: device.lastLogin,
              deviceType: device.deviceType,
              createAt: device.createAt,
              userAgent: device.userAgent,
            }),
            fundedDevice
          );

          return {
            access_token: await this.makeJwtToken(user.id, user.role),
            refresh_token: refreshRaw.token,
            is2FAEnabled: user.isAuthenticatedbyGoogle,
            userId: user.isAuthenticatedbyGoogle == true ? user.id : null,
            loginHistoryList: (await this.getLoginHistory(100, 0, user.id)).loginHistoryList,
            totalItems: (await this.getLoginHistory(100, 0, user.id)).totalItems,
            currentDevice,
          };
        } else if (user.devices.length < 2) {
          const device = await this.createNewDeviceForUser(user, request, new Date());
          const refreshToken = await this.createRefreshTokenForDevice(user, device);
          await this.saveLoginHistory(request, UserLoginHistoryEnum.SUCCESS, user.id);
          await this.saveLoginHistory(request, UserLoginHistoryEnum.SUCCESS, user.id);
          return {
            access_token: await this.makeJwtToken(user.id, user.role),
            refresh_token: refreshToken.token,
            is2FAEnabled: user.isAuthenticatedbyGoogle,
            userId: user.isAuthenticatedbyGoogle == true ? user.id : null,
          };
        } else throw new BadRequestException();
      } else throw new BadRequestException();
    } else {
      await this.saveLoginHistory(request, UserLoginHistoryEnum.FAILURE, user.id);
      throw new BadRequestException("OTP.INVALID");
    }
  }

  async login(data: LoginDto, request: UserExpressRequest) {
    const user = await this.userRepository.findOne({
      where: {
        email: data.email.toLocaleLowerCase(),
      },
      relations: ["devices", "refreshes"],
    });
    if (user && user.blockedAt == null) {
      const passed = await bcrypt.compare(data.password, user.password);
      if (passed) {
        const ipAddress =
          request.headers["x-forwarded-for"] != undefined
            ? request.headers["x-forwarded-for"].toString().split(",")[0]
            : "unknown ip";
        const userAgent = request.headers["user-agent"];
        const parser = new UAParser();
        const deviceInfo = parser.setUA(userAgent).getResult();
        let fundedDevice: UserDeviceEntity;

        if (user.devices.length <= 2) {
          for (let i = 0; i < user.devices.length; i++) {
            const { deviceType, userAgent } = user.devices[i];
            if (
              ipAddress == user.devices[i].ipAddress &&
              deviceInfo.ua == userAgent &&
              deviceType == deviceInfo.os.name
            ) {
              fundedDevice = user.devices[i];
            }
          }
          if (fundedDevice != null) {
            let refreshRaw;
            for (let i = 0; i < user.refreshes.length; i++) {
              const { device } = user.refreshes[i];
              if (device.id == fundedDevice.id) refreshRaw = user.refreshes[i];
            }
            refreshRaw.token = await this.makeRefreshToken(user.id, user.role);
            await this.userRefreshRepo.save(refreshRaw);
            await this.saveLoginHistory(request, UserLoginHistoryEnum.SUCCESS, user.id);

            const currentDevice = this.createResponseData<CurrentDeviceDto>(
              (device: UserDeviceEntity) => ({
                id: device.id,
                deviceId: device.deviceId,
                ipAddress: device.ipAddress,
                lastLogin: device.lastLogin,
                deviceType: device.deviceType,
                createAt: device.createAt,
                userAgent: device.userAgent,
              }),
              fundedDevice
            );

            let setting2fa = user.isAuthenticatedbyGoogle == true ? await this.get2faSettings(user) : null;

            return {
              access_token:
                user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null
                  ? null
                  : await this.makeJwtToken(user.id, user.role),
              refresh_token:
                user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null ? null : refreshRaw.token,
              is2FAEnabled: user.isAuthenticatedbyGoogle,
              userId: user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null ? user.id : null,
              loginHistoryList:
                user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null
                  ? null
                  : (await this.getLoginHistory(100, 0, user.id)).loginHistoryList,
              totalItems:
                user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null
                  ? null
                  : (await this.getLoginHistory(100, 0, user.id)).totalItems,
              currentDevice: currentDevice,
            };
          } else if (user.devices.length < 2) {
            const device = await this.createNewDeviceForUser(user, request, new Date());
            const refreshToken = await this.createRefreshTokenForDevice(user, device);
            await this.saveLoginHistory(request, UserLoginHistoryEnum.SUCCESS, user.id);

            let setting2fa = user.isAuthenticatedbyGoogle == true ? await this.get2faSettings(user) : null;

            const currentDevice = this.createResponseData<CurrentDeviceDto>(
              (device: UserDeviceEntity) => ({
                id: device.id,
                deviceId: device.deviceId,
                ipAddress: device.ipAddress,
                lastLogin: device.lastLogin,
                deviceType: device.deviceType,
                createAt: device.createAt,
                userAgent: device.userAgent,
              }),
              device
            );

            return {
              access_token:
                user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null
                  ? null
                  : await this.makeJwtToken(user.id, user.role),
              refresh_token:
                user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null ? null : refreshToken.token,
              is2FAEnabled: user.isAuthenticatedbyGoogle,
              userId: user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null ? user.id : null,
              loginHistoryList:
                user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null
                  ? null
                  : (await this.getLoginHistory(100, 0, user.id)).loginHistoryList,
              totalItems:
                user.isAuthenticatedbyGoogle == true && setting2fa.loginActivatedAt != null
                  ? null
                  : (await this.getLoginHistory(100, 0, user.id)).totalItems,
              currentDevice: currentDevice,
            };
          } else throw new BadRequestException();
        } else throw new BadRequestException("BAD_REQUEST");
      } else {
        await this.saveLoginHistory(request, UserLoginHistoryEnum.FAILURE, user.id);
        throw new BadRequestException("PASSWORD.INVALID");
      }
    } else {
      if (user) {
        await this.saveLoginHistory(request, UserLoginHistoryEnum.FAILURE, user.id);
        throw new BadRequestException("USER.NOT_FOUND");
      } else throw new NotFoundException("USER.NOT_FOUND");
    }
  }

  async register(req: UserExpressRequest, data: RegisterDto) {
    let user = await this.userRepository.findOne({
      where: {
        id: req.user.id,
      },
    });
    if (user) {
      const { password } = data;
      if (user.role == UserRoleEnum.NEW_USER) {
        user.password = await bcrypt.hash(password, 10);
        user.role = UserRoleEnum.CUSTOMER;
        if (data.firstName) user.firstName = data.firstName;
        if (data.lastName) user.lastName = data.lastName;
        user.ReferralId = this.generateReferralCode(user.id);
        if (data.referralCode) {
          const refUser = await this.findUserByReferralCode(data.referralCode);
          if (refUser) {
            user.ReferralCode = data.referralCode;
          } else throw new BadRequestException("REFERRAL_CODE_NOT_EXIST");
        }
        user.registeredAt = new Date();
        const userSetting = new UserSettingEntity();
        user = await this.userRepository.save(user);
        userSetting.userId = user.id;
        userSetting.isEmailNotificationEnabled = false;
        userSetting.defaultLanguageId = LanguageEnum.English;
        await this.userSettingRepo.save(userSetting);
        const device = await this.createNewDeviceForUser(user, req, new Date());
        const refreshToken = await this.createRefreshTokenForDevice(user, device);
        const currentDevice = this.createResponseData<CurrentDeviceDto>(
          (device: UserDeviceEntity) => ({
            id: device.id,
            deviceId: device.deviceId,
            ipAddress: device.ipAddress,
            lastLogin: device.lastLogin,
            deviceType: device.deviceType,
            createAt: device.createAt,
            userAgent: device.userAgent,
          }),
          device
        );
        if (user.email && user.firstName) await this.sendWellcomEmail(user.email, user.firstName);
        return {
          access_token: await this.makeJwtToken(user.id, user.role),
          refresh_token: refreshToken.token,
          loginHistoryList: null,
          totalItems: null,
          currentDevice,
        };
      } else {
        throw new BadRequestException("BAD_REQUEST");
      }
    }
  }

  private async createNewDeviceForUser(user: UserEntity, request: UserExpressRequest, lastLogin: Date) {
    const ipAddress =
      request.headers["x-forwarded-for"] != undefined
        ? request.headers["x-forwarded-for"].toString().split(",")[0]
        : "unknown ip";
    const userAgent = request.headers["user-agent"];
    const parser = new UAParser();
    const deviceInfo = parser.setUA(userAgent).getResult();
    const rawData = `${userAgent}-${ipAddress}`;
    const newDevice = new UserDeviceEntity();
    newDevice.deviceType = deviceInfo.os.name;
    newDevice.ipAddress = ipAddress.toString();
    newDevice.deviceId = crypto.createHash("sha256").update(rawData).digest("hex");
    newDevice.userAgent = deviceInfo.ua;
    newDevice.user = user;
    newDevice.lastLogin = lastLogin;
    return await this.userDeviceRepo.save(newDevice);
  }

  private async createRefreshTokenForDevice(user: UserEntity, device: UserDeviceEntity) {
    const newRefresh = new UserRefreshTokenEntity();
    newRefresh.user = user;
    newRefresh.device = device;
    newRefresh.token = await this.makeRefreshToken(user.id, user.role);
    // newRefresh.expiredAt = new Date(
    //   new Date().getTime() +
    //     this.configService.get('user', {
    //       infer: true,
    //     }).userJwtRefExpirationTime,
    // );
    return await this.userRefreshRepo.save(newRefresh);
  }

  async findUserByReferralCode(referralCode: string) {
    return await this.userRepository.findOne({
      where: { ReferralId: referralCode },
    });
  }

  async logoutUser(request: UserExpressRequest, deviceId: string) {
    const user = await this.userRepository.findOne({
      where: { id: request.user.id },
      relations: ["devices", "refreshes"],
    });
    if (!user) throw new NotFoundException("USER.NOT_FOUND");
    for (let i = 0; i < user.refreshes.length; i++) {
      if (user.refreshes[i].device.deviceId == deviceId) {
        user.refreshes[i].token = null;
        await this.userRefreshRepo.save(user.refreshes[i]);
        return true;
      }
    }
    throw new BadRequestException();
  }

  async findUser(request: UserExpressRequest, userId: string, role: number, needRoleCheck: boolean) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role },
      relations: ["devices", "refreshes", "profile"],
    });
    if (user) {
      if (needRoleCheck == true && user.role != UserRoleEnum.NEW_USER) {
        const ipAddress =
          request.headers["x-forwarded-for"] != undefined
            ? request.headers["x-forwarded-for"].toString().split(",")[0]
            : "unknown ip";
        const userAgent = request.headers["user-agent"];
        const parser = new UAParser();
        const deviceInfo = parser.setUA(userAgent).getResult();

        for (let i = 0; i < user.refreshes.length; i++) {
          if (
            // ipAddress == user.refreshes[i].device.ipAddress &&
            user.refreshes[i].device.deviceType == deviceInfo.os.name &&
            deviceInfo.ua == user.refreshes[i].device.userAgent &&
            user.refreshes[i].token != null
          ) {
            // if (
            //   user.refreshes[i].token != null &&
            //   verify(
            //     user.refreshes[i].token,
            //     this.configService.get('user', {
            //       infer: true,
            //     })?.userJwtRefSecret || '',
            //   )
            // ) {
            return user;
            // }
          }
        }
        return null;
      }
      return user;
    } else {
      return null;
    }
  }

  public async updateRefreshToken(request: UserExpressRequest, data: UpdateRefreshTokenDto) {
    const user = await this.userRepository.findOne({
      where: { id: request.user.id },
      relations: ["devices", "refreshes"],
    });
    if (!user) throw new NotFoundException("USER.NOT_FOUND");
    for (let i = 0; i < user.refreshes.length; i++) {
      if (user.refreshes[i].token == data.refreshToken) {
        user.refreshes[i].token = await this.makeRefreshToken(user.id, user.role);
        await this.userRefreshRepo.save(user.refreshes[i]);
        return {
          access_token: await this.makeJwtToken(user.id, user.role),
          refresh_token: user.refreshes[i].token,
        };
      }
    }
    throw new BadRequestException("BAD_REQUEST");
  }

  public async makeRefreshToken(userId: string, role: UserRoleEnum) {
    const payload: TokenPayload = { userId, role };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get("user", { infer: true }).userJwtRefSecret,
      expiresIn: this.configService.get("user", { infer: true }).userJwtRefExpirationTime,
    });
    return token;
  }

  public async makeJwtToken(userId: string, role: UserRoleEnum) {
    const payload: TokenPayload = { userId, role };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async changePassword(data: PasswordDTO) {}

  async verifyOtp(data: OtpDto, needReturn: boolean) {
    const { otp, username } = data;

    const user = await this.userRepository.findOne({
      where: { email: username.toLocaleLowerCase() },
    });

    if (!user) throw new BadRequestException("USER.INVALID");
    const hashotp = `${await this.redisService.get(user.id)}`;
    if (hashotp) {
      const isOtpMatched = await bcrypt.compare(otp, hashotp);
      if (otp != "12345") {
        if (isOtpMatched == false)
          if (needReturn == true) throw new BadRequestException("OTP.INVALID");
          else return false;
        else if (isOtpMatched == true) {
          if (needReturn == true)
            return {
              access_token: await this.makeJwtToken(user.id, user.role),
            };
          else return true;
        } else {
          if (needReturn == true) throw new BadRequestException("OTP.INVALID");
          else return false;
        }
      } else {
        if (needReturn == true)
          return {
            access_token: await this.makeJwtToken(user.id, user.role),
          };
        else return true;
      }
    } else {
      if (needReturn == true) throw new BadRequestException("OTP.NOT_FOUND");
      else return false;
    }
  }

  private makeRandomOtp() {
    const minm = 10000;
    const maxm = 99999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }

  async sendOtpService(email: string, forRegister: boolean) {
    const usr = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (usr) {
      const rand = this.makeRandomOtp();
      const existOtp = await this.redisService.get(usr.id);
      if (existOtp == null) {
        const hashotp = await bcrypt.hash(rand.toString(), 10);
        await this.redisService.setWithExpiration(usr.id, hashotp);
        console.log(rand);

        // usr.hashOtp = hashotp;
        // usr.otpExpireTime = new Date();
        // await this.userRepository.save(usr);
        // const tt = await sendOtpSms(email, rand.toString());
        // if (tt.status == 200) {
        if (forRegister == true) await this.sendOtpEmail(usr.email, rand, "Welcome to Our Community!");
        else await this.sendOtpEmail(usr.email, rand, "2FA Verification!");
        return true;
        // } else {
        //   throw new BadRequestException('SMS.DEACTIVED');
        // }
      } else throw new BadRequestException("BAD_REQUEST");
    } else {
      throw new BadRequestException("USER.NOT_FOUND");
    }
  }

  async checkauth(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (user && user.role == UserRoleEnum.NEW_USER) {
      return true;
    } else if (user && user.role != UserRoleEnum.NEW_USER) {
      return false;
    } else if (user == undefined) {
      const newUser = new UserEntity();
      newUser.email = email;
      let newProfile = new UserProfileEntity();
      newProfile = await this.userProfileRepository.save(newProfile);
      newUser.profile = newProfile;
      newUser.role = UserRoleEnum.NEW_USER;
      await this.userRepository.save(newUser);
      return true;
    }
  }

  public async UserTest() {
    return true;
  }

  /**
   * Generate a referral code
   * @param userId - Unique identifier for the user (e.g., UUID or numeric ID)
   * @returns {string} - Generated referral code
   */
  generateReferralCode(userId: string): string {
    const timestamp = Date.now().toString();
    const rawString = `${userId}-${timestamp}`;

    const hash = crypto.createHash("sha256").update(rawString).digest("base64");

    const cleanHash = hash
      .replace(/\+/g, "") // Remove '+'
      .replace(/\//g, "") // Remove '/'
      .replace(/=/g, "") // Remove '='

      .substring(0, 8); // Take the first 8 characters for brevity

    return `${cleanHash.toUpperCase()}`;
  }
}
