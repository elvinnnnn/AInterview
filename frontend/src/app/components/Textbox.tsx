export default function Textbox({
  input,
  isUser,
}: {
  input: string;
  isUser: boolean;
}) {
  return isUser ? (
    <div className="-z-1 relative my-2 ml-auto flex items-center pl-20">
      <div
        id="user-textbox"
        className="flex items-center justify-center p-5 shadow-lg"
      >
        {input}
      </div>
      <div id="user-textbox-arrow" />
    </div>
  ) : (
    <div className="-z-1 relative my-2 flex items-center pr-20">
      <div id="bot-textbox-arrow" />
      <div
        id="bot-textbox"
        className="flex items-center justify-center p-5 shadow-lg"
      >
        {input}
      </div>
    </div>
  );
}
