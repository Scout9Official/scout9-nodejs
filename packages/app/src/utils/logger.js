import readline from 'node:readline';
import logUpdate from 'log-update';
import colors from 'kleur';

export class ProgressLogger {
  constructor(initialMessage = null) {
    this.lines = [];
    this._indents = 0;
    this._interval = -1;
    this._frames = [
      "010010",
      "001100",
      "100101",
      "111010",
      "111101",
      "010111",
      "101011",
      "111000",
      "110011",
      "110101"
    ]
    this._framesSpeed = 80;
    if (initialMessage) {
      this.log(initialMessage);
      this.write(initialMessage)
    }
  }

  set indents(value) {
    this._indents = value;
  }

  log(message, ...args) {
    const formatted = this._format(message);

    // const frames = ['-', '\\', '|', '/'];
    let index = 0;

    logUpdate.clear();
    clearInterval(this._interval);
    this._interval = setInterval(() => {
      const frame = this._frames[index = ++index % this._frames.length];
      logUpdate(`${colors.bold(colors.green(frame))}: ${colors.white(formatted)}`);
    }, this._framesSpeed);

    this.lines.push({message: formatted, type: 'log'});
  }

  info(message, ...args) {
    return this.write('\t - ' + colors.italic(colors.gray(message)));
  }

  success(message, ...args) {
    return this.write(`✅  ${colors.green(message)}`);
  }

  error(message, ...args) {
    return this.write(`❌  ${colors.red(message)}`);
  }

  warn(message, ...args) {
    return this.write(`⚠️ ${colors.yellow(message)}`);
  }

  write(newMessage) {
    if (this.lines.length === 0) {
      throw new Error("No lines to update");
    }

    logUpdate.clear();
    clearInterval(this._interval);
    logUpdate.done();

    // Update the last line in the array
    const lastLine = this.lines[this.lines.length - 1];
    if (lastLine.type === 'log') {
      // Replace the last log line
      this.lines[this.lines.length - 1] = {message: this._format(newMessage), type: 'written'};
    } else {
      // Append the new line
      this.lines.push({message: this._format(newMessage), type: 'written'});
    }

    // Clear all the logged lines and reprint them
    readline.moveCursor(process.stdout, 0, -this.lines.length);
    readline.clearScreenDown(process.stdout);
    this.lines.forEach(line => console.log(line.message));

    // // Move up to the last line
    // readline.moveCursor(process.stdout, 0, -1);
    // readline.clearLine(process.stdout, 0);
    // readline.cursorTo(process.stdout, 0);

    // Log the updated line
    // console.log(newMessage);
  }

  done() {
    logUpdate.clear();
    logUpdate.done();
  }

  _format(message) {
    const indentText = '\t'.repeat(this._indents);
    return `${indentText}${message}`;
  }
}
