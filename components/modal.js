import React, { useRef } from 'react';
import { GrClose } from 'react-icons/gr';
import { useOutsideCallback } from '../hooks/useOutsideCallback';
import Button from './button';
import Input from './input';

export default function Modal({
  handleAddError,
  values,
  setValues,
  setShowModal,
  showModal,
}) {
  const modalRef = useRef(null);

  useOutsideCallback(modalRef, () => {
    if (showModal || showModal === 0) setShowModal(false);
  });

  const handleChange = ({ target }) => {
    setValues({ ...values, [target.name]: target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddError({
      ...values,
      reportedAt: values?.reportedAt || new Date().toLocaleDateString('en-us'),
    });
    setValues({});
    setShowModal(false);
  };

  return (
    (showModal || showModal === 0) && (
      <>
        <form
          onSubmit={handleSubmit}
          className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none'
        >
          <div
            className='relative my-6 mx-auto w-auto max-w-3xl'
            ref={modalRef}
          >
            {/*content*/}
            <div className='relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none'>
              {/*header*/}
              <div className='flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5'>
                <h3 className='text-3xl font-semibold'>
                  {showModal === 'new' ? 'Add Error' : 'Edit Error'}
                </h3>
                <button
                  className='float-right ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black  outline-none focus:outline-none'
                  onClick={() => setShowModal(false)}
                >
                  <GrClose />
                </button>
              </div>
              {/*body*/}
              <div className='col relative grid flex-auto gap-1 p-6'>
                <Input
                  type='text'
                  placeholder='My first bug'
                  name='title'
                  label='Title'
                  value={values.title}
                  onChange={handleChange}
                  required
                />
                <div className='grid grid-cols-2 gap-10'>
                  <Input
                    type='text'
                    name='assignedTo'
                    label='Assigned To'
                    value={values.assignedTo}
                    onChange={handleChange}
                    placeholder='John Doe'
                    required
                  />
                  <Input
                    type='text'
                    name='reportedBy'
                    label='Reported By'
                    value={values.reportedBy}
                    onChange={handleChange}
                    placeholder='John Doe'
                    required
                  />
                </div>
                <div className='grid grid-cols-2 gap-10'>
                  <Input
                    required
                    type='option'
                    value={values.severity}
                    onChange={handleChange}
                    name='severity'
                    label='Severity'
                  >
                    <option value='' selected disabled>
                      Select
                    </option>
                    <option value='Low'>Low</option>
                    <option value='Medium'>Medium</option>
                    <option value='High'>High</option>
                    <option value='Very High'>Very High</option>
                  </Input>
                  <Input
                    onChange={handleChange}
                    required
                    value={values.status}
                    type='option'
                    name='status'
                    label='Status'
                  >
                    <option value='' selected disabled>
                      Select
                    </option>
                    <option value='Not Started'>Not Started</option>
                    <option value='In Progress'>In Progress</option>
                    <option value='Ready For Testing'>Ready For Testing</option>
                    <option value='Completed'>Completed</option>
                  </Input>
                </div>
                <Input
                  onChange={handleChange}
                  required
                  value={values.environment}
                  type='option'
                  name='environment'
                  label='Environment'
                >
                  <option value='' selected disabled>
                    Select
                  </option>
                  <option value='pre-production'>Pre-Production</option>
                  <option value='production'>Production</option>
                </Input>
                <Input
                  required
                  onChange={handleChange}
                  value={values.currentBehavior}
                  type='textarea'
                  placeholder='Application is...'
                  name='currentBehavior'
                  label='Current Behavior'
                />
                <Input
                  required
                  onChange={handleChange}
                  type='textarea'
                  value={values.expectedBehavior}
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
    )
  );
}
