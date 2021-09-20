//
//  CredoRNWebviewModule.swift
//  CredoRNWebviewModule
//
//  Copyright © 2021 Oladipo E Olaide. All rights reserved.
//

import Foundation

@objc(CredoRNWebviewModule)
class CredoRNWebviewModule: NSObject {
  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
