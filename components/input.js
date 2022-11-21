import clsx from 'clsx';

const getComponent = (type) => {
  switch (type) {
    case 'option':
      return 'select';
    case 'textarea':
      return 'textarea';
    default:
      return 'input';
  }
};

export default ({ label, name, className, type, addOn, ...props }) => {
  const Component = getComponent(type);

  return (
    <div className='grid'>
      {label && (
        <label
          htmlFor={name}
          className={
            'mb-2 block text-left text-sm font-medium text-gray-900 dark:text-gray-300' +
            (props.required ? ' required' : '')
          }
        >
          {label}
        </label>
      )}
      <div className='flex'>
        {addOn && (
          <span class='inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-red-400 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400'>
            {addOn}
          </span>
        )}

        <Component
          className={clsx(
            'block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-red-500 dark:focus:ring-red-500',
            addOn && 'rounded-none rounded-r-lg',
            className
          )}
          name={name}
          {...props}
        />
      </div>
    </div>
  );
};
