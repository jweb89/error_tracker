export default ({ className, ...props }) => {
  return (
    <button
      className={
        'mr-1 mb-1 rounded bg-red-400 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-lg focus:outline-none active:bg-red-600 ' +
        className
      }
      {...props}
    />
  );
};
