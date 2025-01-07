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

export enum ConflictMessage {
  CategoryTitle = "عنوان دسته بندی قبلا ثبت شده است",
}

export enum NotFoundMessage {
  Any = "موردی یافت نشد",
  NotFoundCategory = "دسته بندی یافت نشد",
  NotFoundPost = "مقاله ای یافت نشد",
  NotFoundUser = "کاربری یافت نشد",
}

export enum ValidationMessage {
  InvalidImageFormat = "فرمت تصویر انتخاب شده باید از نوع png ، jpg ، jpeg باشد",
}

export enum PublicMessage {
  SendOtp = "کد یکبار مصرف با موفقیت برای شما ارسال شد",
  LoggedIn = "ورود به حساب کاربری موفقیت آمیز یود",
  Created = "با موفقیت ایجاد شد",
  Deleted = "با موفقیت حذف شد",
  Updated = "با موفقیت بروز رسانی شد",
  Inserted = "با موفقیت اضافه شد",
}
