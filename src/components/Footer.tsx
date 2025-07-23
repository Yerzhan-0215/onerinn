const Footer = () => {
  return (
    <footer className="text-center text-sm text-gray-500 py-1 m-0 leading-none"> {/* ✅ 缩小padding并去除外边距 */}
      © {new Date().getFullYear()} Onerinn. All rights reserved.
    </footer>
  );
};

export default Footer;