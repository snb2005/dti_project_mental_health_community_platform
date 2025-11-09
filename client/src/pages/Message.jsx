import ReactMarkdown from "react-markdown"

const Message = ({ sender, text }) => {
  return (
    <div className={`flex ${sender === "user" ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-3xl rounded-2xl p-4 shadow-soft ${
          sender === "user"
            ? "bg-gradient-to-r from-primary to-primary-light text-white"
            : "bg-white dark:bg-gray-800 border border-card-border"
        }`}
      >
        <ReactMarkdown
          children={text}
          components={{
            p: ({ children }) => <p className="mb-2">{children}</p>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            code: ({ children }) => (
              <code
                className={`rounded px-1 ${sender === "user" ? "bg-primary-dark" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre
                className={`rounded p-2 mb-2 overflow-x-auto ${sender === "user" ? "bg-primary-dark" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                {children}
              </pre>
            ),
          }}
        />
      </div>
    </div>
  )
}

export default Message

