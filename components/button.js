import { Button } from 'flowbite-react';

export default ({ className, skipClass, ...props }) => {
  return (
    <Button
      className={
        !skipClass &&
        '!bg-red-400 text-white  shadow hover:!bg-red-500 active:!bg-red-600 ' +
          className
      }
      {...props}
    />
  );
};
