import React, { useState } from 'react';
import { GrClose } from 'react-icons/gr';
import Button from './button';
import Input from './input';

export default function Modal({ handleAddError }) {
  const [showModal, setShowModal] = useState(false);
  const [values, setValues] = useState({});

  const handleChange = ({ target }) => {
    setValues({ ...values, [target.name]: target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddError({
      ...values,
      reportedAt: new Date().toLocaleDateString('en-us'),
    });
    setShowModal(false);
  };

  return (
    <>
      <Button className='float-right' onClick={() => setShowModal(true)}>
        Add Error
      </Button>
      {showModal ? (
        <>
          <form
            onSubmit={handleSubmit}
            className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none'
          >
            <div className='relative my-6 mx-auto w-auto max-w-3xl'>
              {/*content*/}
              <div className='relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none'>
                {/*header*/}
                <div className='flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5'>
                  <h3 className='text-3xl font-semibold'>Add Error</h3>
                  <button
                    className='float-right ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black  outline-none focus:outline-none'
                    onClick={() => setShowModal(false)}
                  >
                    <GrClose />
                  </button>
                </div>
                {/*body*/}
                <div className='col relative grid flex-auto gap-5 p-6'>
                  <Input
                    type='text'
                    placeholder='My first bug'
                    name='title'
                    label='Title'
                    onChange={handleChange}
                    required
                  />
                  <div className='grid grid-cols-2 gap-10'>
                    <Input
                      type='text'
                      name='assignedTo'
                      label='Assigned To'
                      onChange={handleChange}
                      placeholder='John Doe'
                      required
                    />
                    <Input
                      type='text'
                      name='reportedBy'
                      label='Reported By'
                      onChange={handleChange}
                      placeholder='John Doe'
                      required
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-10'>
                    <Input
                      required
                      type='option'
                      onChange={handleChange}
                      name='severity'
                      label='Severity'
                    >
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='medium'>High</option>
                      <option value='medium'>Very High</option>
                    </Input>
                    <Input
                      onChange={handleChange}
                      required
                      type='option'
                      name='status'
                      label='Status'
                    >
                      <option value='low'>Not Started</option>
                      <option value='medium'>In Progress</option>
                      <option value='medium'>Ready For Testing</option>
                      <option value='medium'>Completed</option>
                    </Input>
                  </div>
                  <Input
                    required
                    onChange={handleChange}
                    type='textarea'
                    placeholder='Application is...'
                    name='currentBehavior'
                    label='Current Behavior'
                  />
                  <Input
                    required
                    onChange={handleChange}
                    type='textarea'
                    placeholder='Application should...'
                    name='expectedBehavior'
                    label='Expected Behavior'
                  />
                </div>
                {/*footer*/}
                <div className='flex items-center justify-end rounded-b border-t border-solid border-slate-200 p-6'>
                  <button
                    className='background-transparent mr-1 mb-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none'
                    type='button'
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <Button type='submit'>Save Changes</Button>
                </div>
              </div>
            </div>
          </form>
          <div className='fixed inset-0 z-40 bg-black opacity-25'></div>
        </>
      ) : null}
    </>
  );
}
