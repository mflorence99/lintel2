// 📘 define the messages that flow to and from extension and webview

export type Message = {
  command: /* excuse the indentation - blame prettier */
  // 👇 these special commands are used  by the simulator
  | '__ping__'
    | '__pong__'
    | '__smoke_test__'
    // 👇 these are REAL commands
    | 'initialize';
};
