import { spawn } from 'child_process';
import { resolve } from 'path';
import { infoMessage } from './ui.js';

// Known terminal editors
const TERMINAL_EDITORS = ['nano', 'vim', 'vi', 'emacs', 'nvim', 'helix', 'micro'];

// Known GUI editors with CLI commands
const GUI_EDITORS = ['code', 'subl', 'atom', 'notepad++', 'gedit'];

export async function openInEditor(filePath, editorCommand = 'nano', editorOverride = null) {
  // Use override if provided, otherwise use the configured editor
  const editor = editorOverride || editorCommand;

  // Show which editor is being used
  infoMessage(`Opening in ${editor}...`);
  const absolutePath = resolve(filePath);
  const editorLower = editor.toLowerCase();

  // Detect editor type
  const isTerminalEditor = TERMINAL_EDITORS.includes(editorLower);
  const isGUIEditor = GUI_EDITORS.includes(editorLower);

  if (isTerminalEditor) {
    // Use spawn for terminal editors - wait for completion
    return openInTerminalEditor(absolutePath, editor);
  } else if (isGUIEditor) {
    // Use spawn with --wait flag for GUI editors
    return openInGUIEditor(absolutePath, editor);
  } else {
    // Fallback: try as terminal editor
    return openInTerminalEditor(absolutePath, editor);
  }
}

function openInTerminalEditor(filePath, editor) {
  return new Promise((resolve, reject) => {
    const editorProcess = spawn(editor, [filePath], {
      stdio: 'inherit',  // Inherit parent's stdin, stdout, stderr
      shell: false
    });

    editorProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Editor exited with code ${code}`));
      }
    });

    editorProcess.on('error', (error) => {
      console.error(`\nError: Failed to open editor "${editor}":`, error.message);
      console.error('Please check your jerd.config.js and ensure the editor is installed.');
      reject(error);
    });
  });
}

function openInGUIEditor(filePath, editor) {
  return new Promise((resolve, reject) => {
    // Most GUI editors support --wait flag to block until closed
    const args = ['--wait', filePath];

    const editorProcess = spawn(editor, args, {
      stdio: 'ignore',
      detached: false
    });

    editorProcess.on('exit', (code) => {
      resolve();
    });

    editorProcess.on('error', (error) => {
      // Try without --wait flag as fallback
      const fallbackProcess = spawn(editor, [filePath], {
        stdio: 'ignore',
        detached: true
      });

      fallbackProcess.unref(); // Allow parent to exit
      resolve(); // Don't wait for GUI editor
    });
  });
}
