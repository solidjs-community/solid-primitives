const Footer = () => {
  return (
    <footer class="bg-[#F3F5F7] dark:bg-slate-800/50">
      <div class="max-w-[864px] mx-auto leading-7 mt-10 p-4 py-8">
        <p class="text-center">
          This site is built with SolidJS, SolidStart, and best of all ...{" "}
          <span class="whitespace-nowrap">Solid Primitives</span>!
        </p>
        <p>Examples</p>
        <ul>
          <li>open search menu with hotkeys with createShortcut</li>
          <li>change table header with createIntersectionObserver</li>
          <li>toggle navigation menu animation with createTween</li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
