export function message(msg, props) {
  return {
    ...props,
    message: msg
  };
}