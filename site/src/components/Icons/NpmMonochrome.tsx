const NpmMonochrome = () => {
  return (
    <svg viewBox="0 0 18 7" xmlns="http://www.w3.org/2000/svg" style="height: 100%;">
      <path
        class="dark:hidden"
        fill="currentColor"
        d="M0 0v6h5v1h4V6h9V0H0zm1 1h4v4H4V2H3v3H1V1zm5 0h4v4H8v1H6V1zm5 0h6v4h-1V2h-1v3h-1V2h-1v3h-2V1zM8 2v2h1V2H8z"
      />
      <g class="hidden dark:block">
        <path fill="currentColor" d="M1 5h2V2h1v3h1V1H1z" />
        <path fill="currentColor" d="M6 1v5h2V5h2V1H6zm3 3H8V2h1v2z" />
        <path fill="currentColor" d="M11 1v4h2V2h1v3h1V2h1v3h1V1z" />
      </g>
    </svg>
  );
};

export default NpmMonochrome;
