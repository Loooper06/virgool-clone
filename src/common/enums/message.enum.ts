export enum BadRequestMessage {
  InValidLoginData = "اطلاعات ارسال شده برای ورود صحیح نمی باشد",
  InValidRegisterData = "اطلاعات ارسال شده برای ثبت نام صحیح نمی باشد",
}

export enum AuthMessage {
  NotFoundAccount = "حساب کاربری یافت نشد !",
  ConflictAccount = "حساب کاربری قبلا ثبت شده است !",
  CodeExpired = "کد تایید منقضی شده است ، مجددا تلاش نمایید",
  TryAgain = "مجددا تلاش نمایید",
  LoginAgain = "مجددا وارد حساب کاربری خود شوید",
  RequiredLogin = "وارد حساب کاربری خود شوید",
}

export enum NotFoundMessage {}

export enum ValidationMessage {}

export enum PublicMessage {
  SendOtp = "کد یکبار مصرف با موفقیت برای شما ارسال شد",
  LoggedIn = "ورود به حساب کاربری موفقیت آمیز یود",
}
