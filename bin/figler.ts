import figlet from 'figlet';

// 📘 log short string using figlet

export function figletize(str: string): void {
  console.log(
    `%c${figlet.textSync(str.toUpperCase(), {
      font: 'Slant',
      horizontalLayout: 'fitted'
    })}`,
    'color: green'
  );
}
