export default function Textbox({
  css,
  input,
  isUser,
}: {
  css: string;
  input: string;
  isUser: boolean;
}) {
  return (
    <div className="-z-1">
      <div
        id={isUser ? "user-textbox-arrow" : "bot-textbox-arrow"}
        className={isUser ? "absolute bottom-0 right-0 mb-6" : "ml-26 md:ml-12"}
      />
      <div
        id={isUser ? "user-textbox" : "bot-textbox"}
        className={`flex absolute items-center justify-center uninteractable shadow-lg ${css}`}
      >
        {input}
      </div>
    </div>
  );
}
