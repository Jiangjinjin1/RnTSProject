//
//  RNToNativeBridge.m
//  RnTSProject
//
//  Created by 江金金 on 2021/12/27.
//

#import "RNToNativeBridge.h"

@implementation RNToNativeBridge
RCT_EXPORT_MODULE();

#pragma mark 获取app版本号
RCT_EXPORT_METHOD(getAppVersion:(RCTResponseSenderBlock)callback) {
  if (callback) {
    callback(@[@{@"appVersion": [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"]}]);
  }
}

#pragma mark 测试promise返回
RCT_EXPORT_METHOD(getPromiseText:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  resolve(@[@"this is a promise function"]);
}

@end
