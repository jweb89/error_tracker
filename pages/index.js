import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { FaTrash, FaPlus, FaEdit, FaCopy } from 'react-icons/fa';
import { AiOutlineMenu } from 'react-icons/ai';
import Input from '../components/input';
import Modal from '../components/modal';
import Button from '../components/button';
import cloneDeep from 'lodash/cloneDeep';
import { Sidebar, Table, Tooltip } from 'flowbite-react';
import { IoMdClose } from 'react-icons/io';

import { afterSave, getStatusColor } from '../helpers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import clsx from 'clsx';
import { useOutsideCallback } from '../hooks/useOutsideCallback';

const TableCell = ({
  children,
  label,
  className,
  labelClassName,
  ...props
}) => {
  return (
    <Table.Cell
      {...props}
      className={clsx(
        'relative w-2/4 border-gray-400 pl-4 pt-8 pb-2 text-left sm:table-cell sm:w-auto sm:flex-1  sm:pt-2',
        className
      )}
    >
      <span
        className={clsx(
          'absolute inset-x-0 top-0 bg-gray-200 p-1 pl-2 text-xs font-bold uppercase text-black sm:hidden',
          labelClassName
        )}
      >
        {label}
      </span>
      {children}
    </Table.Cell>
  );
};

export default function Home() {
  const [project, setProject] = useState([]);
  const [projectIds, setProjectIds] = useState({});
  const [projectInput, setProjectInput] = useState('');
  const [errors, setErrors] = useState({});
  const [currentProject, setCurrentProject] = useState(null);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(undefined);
  const [values, setValues] = useState({});

  const menuRef = useRef(null);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  useOutsideCallback(menuRef, () => {
    menuOpen && setMenuOpen(false);
  });

  useEffect(() => {
    const project = JSON.parse(localStorage.getItem('project'));
    if (project) {
      setProject(project);
    }
    const errors = JSON.parse(localStorage.getItem('errors'));
    if (errors) {
      setErrors(errors);
    }
    const currentProject = JSON.parse(localStorage.getItem('currentProject'));
    if (currentProject) {
      setCurrentProject(currentProject);
    }
    const projectIds = JSON.parse(localStorage.getItem('projectIds'));
    if (projectIds) {
      setProjectIds(projectIds);
    }
  }, []);

  const openModal = (i, values) => {
    setValues(values);
    setShowModal(i);
  };

  const handleChange = ({ target }) => {
    setProjectInput(target.value);
  };

  const handleDelete = (projectName) => {
    const newProject = project.filter((p) => p !== projectName);
    setProject(newProject);
    const newErrors = cloneDeep(errors);
    delete newErrors[projectName];
    setErrors(newErrors);

    afterSave('errors', newErrors);
    afterSave('project', newProject);
    toast.success('Project deleted');
  };

  const handleAddProject = () => {
    if (project.includes(projectInput) || !projectInput) {
      toast.error('Project must have unique name');
      return;
    }
    const newProject = [...project, projectInput];
    setProject(newProject);
    setProjectInput('');
    setCurrentProject(projectInput);
    afterSave('project', newProject);
    afterSave('currentProject', projectInput);
    toast.success('Project created');
  };

  const getProjectId = (projectName) => {
    const newProjectIds = cloneDeep(projectIds);
    if (!newProjectIds?.[projectName]) {
      newProjectIds[projectName] = 1;
    }
    const id = newProjectIds[projectName];
    newProjectIds[projectName]++;
    setProjectIds(newProjectIds);

    afterSave('projectIds', newProjectIds);

    return id;
  };

  const handleAddError = (values) => {
    const newErrors = cloneDeep(errors);
    if (!newErrors[currentProject]) {
      newErrors[currentProject] = [];
    }
    newErrors[currentProject].push({
      id: getProjectId(currentProject),
      ...values,
    });
    setErrors(newErrors);
    afterSave('errors', newErrors);
    toast.success('Error created');
  };

  const handleDeleteError = (i) => {
    const newErrors = cloneDeep(errors);
    if (!newErrors[currentProject]) {
      newErrors[currentProject] = [];
    }
    newErrors[currentProject].splice(i, 1);
    setErrors(newErrors);
    afterSave('errors', newErrors);
    toast.success('Error deleted');
  };

  const handleEditError = (values, i) => {
    const newErrors = cloneDeep(errors);
    if (!newErrors[currentProject]) {
      newErrors[currentProject] = [];
    }
    newErrors[currentProject][i] = values;
    setErrors(newErrors);
    afterSave('errors', newErrors);
    toast.success('Error edited');
  };

  const handleDuplicate = (i) => {
    const newErrors = cloneDeep(errors);
    if (!newErrors[currentProject]) {
      newErrors[currentProject] = [];
    }
    newErrors[currentProject].splice(i + 1, 0, {
      ...newErrors[currentProject][i],
      id: getProjectId(currentProject),
      title: `${newErrors[currentProject][i].title} (copy)`,
    });
    setErrors(newErrors);
    afterSave('errors', newErrors);
    toast.success('Error duplicated');
  };

  const handleChangeProject = (project) => {
    setCurrentProject(project);
    afterSave('currentProject', project);
  };

  return (
    <div>
      <Head>
        <title>Error Tracker</title>
        <meta name='description' content='Error Tracker' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main
        className={clsx(
          'absolute top-0 bottom-0  flex h-full w-full lg:grid lg:grid-cols-12',
          '[&_div[data-testid="table-element"]]:!shadow-none',
          '[&_div[data-testid="table-element"]]:!overflow-hidden'
        )}
      >
        {menuOpen && (
          <div className='fixed inset-0 z-40 bg-black opacity-25'></div>
        )}
        <Sidebar
          className={clsx(
            menuOpen ? 'fixed inset-0 z-50 w-3/4 shadow-lg md:w-2/5' : 'hidden',
            'h-full w-full lg:col-span-3 lg:block [&>div]:bg-red-400'
          )}
        >
          <div className='h-full w-full' ref={menuRef}>
            <IoMdClose
              className='float-right -mb-5 cursor-pointer text-3xl text-white'
              onClick={toggleMenu}
            />
            <Sidebar.Logo
              img='favicon.ico'
              imgAlt='error tracker logo'
              className='mb-3 min-w-full font-mono text-2xl font-bold text-white'
            >
              Error Tracker
            </Sidebar.Logo>

            <Sidebar.Items>
              <Sidebar.ItemGroup>
                {project.map((project) => {
                  return (
                    <Sidebar.Item
                      active={currentProject === project}
                      className={clsx(
                        'cursor-pointer hover:!bg-red-500',
                        currentProject === project && '!bg-red-600'
                      )}
                      onClick={() => handleChangeProject(project)}
                      key={project}
                    >
                      <div className='flex items-center justify-between text-white'>
                        {project}
                        <FaTrash onClick={() => handleDelete(project)} />
                      </div>
                    </Sidebar.Item>
                  );
                })}
                <div className='flex items-center justify-between border-b border-white py-2 px-5'>
                  <input
                    className='mr-3 w-full appearance-none border-none bg-transparent py-1 px-0 leading-tight text-white placeholder:text-gray-200 focus:outline-none focus:ring-0 focus:ring-offset-0'
                    type='text'
                    onChange={handleChange}
                    value={projectInput}
                    placeholder='My project'
                    aria-label='Project name'
                  />
                  <button onClick={handleAddProject} disabled={!projectInput}>
                    <FaPlus className='my-auto cursor-pointer text-white' />
                  </button>
                </div>
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </div>
        </Sidebar>

        <div className='w-full p-2 lg:col-span-9 lg:p-5'>
          <div className='mb-3 flex justify-between'>
            <AiOutlineMenu
              onClick={toggleMenu}
              className='my-auto cursor-pointer text-4xl text-red-400 lg:hidden'
            />
            <Input
              type='text'
              className='rounded'
              placeholder='Search title'
              onChange={({ target }) => setSearch(target.value)}
            />
            {/* <Modal
              handleAddError={handleAddError}
              TriggerComponent={(props) => ( */}
            <Button
              color='failure'
              className='float-right'
              onClick={() => openModal('new', {})}
            >
              Add Error
            </Button>
            {/* )}
            /> */}
          </div>
          <Table className='rounded !shadow-none sm:border'>
            <Table.Head className='!invisible !absolute bg-gray-200 sm:!visible sm:!relative'>
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell>Reported By</Table.HeadCell>
              <Table.HeadCell>Reported At</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Severity</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {errors?.[currentProject]
                ?.filter((error) =>
                  !search
                    ? true
                    : error.title
                        ?.toLowerCase()
                        ?.includes(search?.toLowerCase())
                )
                ?.map((error, i) => {
                  const {
                    id,
                    title,
                    reportedBy,
                    reportedAt,
                    status,
                    severity,
                  } = error;
                  return (
                    <Table.Row
                      className='mb-6 flex cursor-pointer flex-row flex-wrap rounded-xl border shadow-lg hover:bg-gray-100 max-sm:hover:border-red-500 sm:mb-0 sm:table-row sm:flex-nowrap sm:shadow-none'
                      key={id}
                      onClick={() => openModal(i, error)}
                    >
                      <TableCell label='Title' labelClassName='rounded-tl-xl'>
                        {title}
                      </TableCell>
                      <TableCell
                        label='Reported By'
                        labelClassName='rounded-tr-xl'
                      >
                        {reportedBy}
                      </TableCell>
                      <TableCell label='Reported At'>{reportedAt}</TableCell>
                      <TableCell label='Status'>
                        <Button
                          pill
                          size='xs'
                          skipClass
                          color={getStatusColor(status)}
                        >
                          {status}
                        </Button>
                      </TableCell>
                      <TableCell label='Serverity'>{severity}</TableCell>
                      <TableCell label='Actions'>
                        <div className='flex flex-row justify-evenly'>
                          <Tooltip content='Edit Error'>
                            <FaEdit
                              className='text-red-400 hover:text-red-700'
                              onClick={() => openModal(i, error)}
                            />
                          </Tooltip>
                          <Tooltip content='Delete Error'>
                            <FaTrash
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteError(i);
                              }}
                              className='text-red-500 hover:text-red-700'
                            />
                          </Tooltip>
                          <Tooltip content='Duplicate Error'>
                            <FaCopy
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(i);
                              }}
                              className='text-red-500 hover:text-red-700'
                            />
                          </Tooltip>
                        </div>
                      </TableCell>
                    </Table.Row>
                  );
                })}
            </Table.Body>
          </Table>
          <Modal
            showModal={showModal}
            setShowModal={setShowModal}
            handleAddError={(values) => {
              Number.isInteger(showModal)
                ? handleEditError(values, showModal)
                : handleAddError(values);
            }}
            values={values}
            setValues={setValues}
          />
        </div>
      </main>
      <ToastContainer
        autoClose={3000}
        position='bottom-center'
        theme='dark'
        closeOnClick
        pauseOnHover={false}
      />
    </div>
  );
}
