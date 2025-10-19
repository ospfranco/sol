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

    var panel: ShellOutputFloatingPanel?
    DispatchQueue.main.sync {
      panel = ShellOutputFloatingPanel()
      panel?.appendOutput("$ " + command + "\n")
      panel?.showAndClose(after: 9999)  // keep open until we finish
    }

    let fileHandle = pipe.fileHandleForReading
    fileHandle.readabilityHandler = { handle in
      let data = handle.availableData
      if let str = String(data: data, encoding: .utf8), !str.isEmpty {
        DispatchQueue.main.async {
          panel?.appendOutput(str)
        }
      }
    }

    task.terminationHandler = { _ in
      fileHandle.readabilityHandler = nil
      DispatchQueue.main.async {
        panel?.setFinishedStyle()
        panel?.showAndClose(after: 5)
      }
    }

    task.launch()
  }
}
