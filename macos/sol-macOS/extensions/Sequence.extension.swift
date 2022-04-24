//
//  Sequence.extension.swift
//  sol-macOS
//
//  Created by Oscar on 06.03.22.
//

import Foundation

extension Sequence where Element == UInt8 {
    var data: Data { .init(self) }
    var base64Decoded: Data? { Data(base64Encoded: data) }
    var string: String? { String(bytes: self, encoding: .utf8) }
}
