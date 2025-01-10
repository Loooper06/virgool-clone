export enum BadRequestMessage {
  InValidLoginData = "اطلاعات ارسال شده برای ورود صحیح نمی باشد",
  InValidRegisterData = "اطلاعات ارسال شده برای ثبت نام صحیح نمی باشد",
  SomeThingWentWrong = "خطایی پیش آمد ، مجددا تلاش نمایید",
  InvalidCategories = "دسته بندی ها به درستی وارد نشده است",
  Already_Accepted = "نظر انتخاب شده قبلا تایید شده است",
  Already_Rejected = "نظر انتخاب شده قبلا رد شده است",
  Invalid_Following = "مجاز به انجام این کار نیستید"
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
  Email = "ایمیل وارد شده نمی تواند ثبت شود",
  Phone = "موبایل وارد شده نمی تواند ثبت شود",
  Username = "نام کاربری وارد شده نمی تواند ثبت شود",
}

export enum NotFoundMessage {
  Any = "موردی یافت نشد",
  NotFoundCategory = "دسته بندی یافت نشد",
  NotFoundPost = "مقاله ای یافت نشد",
  NotFoundUser = "کاربری یافت نشد",
}

export enum ValidationMessage {
  InvalidImageFormat = "فرمت تصویر انتخاب شده باید از نوع png ، jpg ، jpeg باشد",
  EMAIL_INVALID = "ایمیل وارد شده معتبر نمی باشد",
  PHONE_INVALID = "موبایل وارد شده معتبر نمی باشد",
}

export enum PublicMessage {
  SendOtp = "کد یکبار مصرف با موفقیت برای شما ارسال شد",
  LoggedIn = "ورود به حساب کاربری موفقیت آمیز یود",
  Created = "با موفقیت ایجاد شد",
  Deleted = "با موفقیت حذف شد",
  Updated = "با موفقیت بروز رسانی شد",
  Inserted = "با موفقیت اضافه شد",
  Like = "مقاله با موفقیت لایک شد",
  DisLike = "لایک از مقاله برداشته شد",
  Bookmark = "مفاله ذخیره شد",
  UnBookmark = "مقاله از لیست ذخیره ها حذف شد",
  CreatedComment = "نظر شما با موفقیت ثبت شد",
  Followed = "با موفقیت دنبال شد",
  UnFollowed = "کاربر از لیست دنبال شوندگان حذف شد",
}

export enum ForbiddenMessage {
  Forbidden = "شما مجاز به انجام این کار نیستید",
}
