import Cocoa
import Foundation

struct ShellHelper {
  static func shWithFloatingPanel(_ command: String) {
    let task = Process()
    let pipe = Pipe()

    task.standardOutput = pipe
    task.standardError = pipe
    task.arguments = ["-l", "-c", command]
    task.launchPath = "/bin/zsh"
    task.standardInput = nil

    if Thread.isMainThread {
      ToastManager.shared.showShellOutput()
      ToastManager.shared.appendShellOutput(command + "\n\n")
    } else {
      DispatchQueue.main.sync {
        ToastManager.shared.showShellOutput()
        ToastManager.shared.appendShellOutput(command + "\n\n")
      }
    }

    let fileHandle = pipe.fileHandleForReading
    fileHandle.readabilityHandler = { handle in
      let data = handle.availableData
      if let str = String(data: data, encoding: .utf8), !str.isEmpty {
        DispatchQueue.main.async {
          ToastManager.shared.appendShellOutput(str)
        }
      }
    }

    task.terminationHandler = { process in
      fileHandle.readabilityHandler = nil
      DispatchQueue.main.async {
        if process.terminationStatus == 0 {
          ToastManager.shared.setShellSuccessStyle()
        } else {
          ToastManager.shared.setShellFailedStyle()
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
          ToastManager.shared.closeShellOutput()
        }
      }
    }

    task.launch()
  }
}
