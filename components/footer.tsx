import React from "react";

const Footer = () => {
  return (
    <footer className="w-full text-center text-xs text-muted-foreground fixed bottom-20 sm:buttom-0">
      © {new Date().getFullYear()} メンヘラTodoアプリ
    </footer>
  );
};

export default Footer;
