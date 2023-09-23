import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { FaTrash, FaPlus, FaEdit, FaCopy, FaSearch } from 'react-icons/fa';
import { AiOutlineMenu } from 'react-icons/ai';
import Input from '../components/input';
import Modal from '../components/modal';
import Button from '../components/button';
import cloneDeep from 'lodash/cloneDeep';
import { Badge, Sidebar, Table, Tooltip } from 'flowbite-react';
import { IoMdClose } from 'react-icons/io';

import { getStatusColor } from '../helpers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import clsx from 'clsx';
import { useOutsideCallback } from '../hooks/useOutsideCallback';
import { CSVLink } from 'react-csv';

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
  const [projectInputLocation, setProjectInputLocation] = useState('');
  const [projectInput, setProjectInput] = useState('');
  const [errors, setErrors] = useState({});
  const [currentProject, setCurrentProject] = useState(null);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(undefined);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [editProject, setEditProject] = useState('');
  const [editProjectInput, setEditProjectInput] = useState('');

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
    setLoading(false);
  }, []);

  // Use useEffect to handle local storage
  useEffect(() => {
    if (loading) return;
    localStorage.setItem('project', JSON.stringify(project));
  }, [...project]);

  useEffect(() => {
    if (loading) return;
    localStorage.setItem('errors', JSON.stringify(errors));
  }, [errors]);

  useEffect(() => {
    if (loading) return;
    localStorage.setItem('currentProject', JSON.stringify(currentProject));
  }, [currentProject]);

  useEffect(() => {
    if (loading) return;
    localStorage.setItem('projectIds', JSON.stringify(projectIds));
  }, [projectIds]);

  const openModal = (i, values) => {
    setValues(values);
    setShowModal(i);
  };

  const handleChange = ({ target }) => {
    setProjectInput(target.value);
  };

  const handleChangeEditProject = ({ target }) => {
    setEditProjectInput(target.value);
  };

  const handleDelete = (projectName) => {
    const newProject = project.filter((p) => p !== projectName);
    setProject(newProject);
    const newErrors = cloneDeep(errors);
    delete newErrors[projectName];
    setErrors(newErrors);
    if (currentProject === projectName) {
      setCurrentProject(null);
    }
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
    toast.success('Error created');
  };

  const restoreError = (error, i, project) => {
    setErrors((errors) => {
      if (!errors[project]) {
        errors[project] = [];
      }
      // If error id already exists just return
      if (errors[project].find((e) => e.id === error?.[0]?.id)) {
        return errors;
      }

      errors[project].splice(i, 0, {
        ...error?.[0],
      });
      return { ...errors };
    });
    toast.success('Error restored');
  };

  const handleDeleteError = async (i) => {
    const newErrors = cloneDeep(errors);
    if (!newErrors[currentProject]) {
      newErrors[currentProject] = [];
    }
    const error = newErrors[currentProject].splice(i, 1);
    const project = currentProject;
    setErrors(newErrors);
    toast.success(
      <span>
        Error Deleted{' '}
        <button
          onClick={() => {
            restoreError(error, i, project);
          }}
          className='float-right hover:underline'
        >
          Undo
        </button>
      </span>
    );
  };

  const handleEditError = (values, i) => {
    const newErrors = cloneDeep(errors);
    if (!newErrors[currentProject]) {
      newErrors[currentProject] = [];
    }
    newErrors[currentProject][i] = values;
    setErrors(newErrors);
    toast.success('Error edited');
  };

  const handleDuplicate = (i) => {
    const newErrors = cloneDeep(errors);
    if (!newErrors[currentProject]) {
      newErrors[currentProject] = [];
    }
    newErrors[currentProject].splice(i + 1, 0, {
      ...newErrors[currentProject]?.[i],
      id: getProjectId(currentProject),
      title: `${newErrors[currentProject]?.[i]?.title} (copy)`,
    });
    setErrors(newErrors);
    toast.success('Error duplicated');
  };

  const handleChangeProject = (project) => {
    setCurrentProject(project);
  };

  const getErrors = () => {
    return errors?.[currentProject]?.filter((error) =>
      !search
        ? true
        : error.title?.toLowerCase()?.includes(search?.toLowerCase())
    );
  };

  const getDre = () => {
    if (!errors?.[currentProject]) return 0;

    return (
      (errors?.[currentProject]?.reduce((acc, error) => {
        if (error.environment === 'pre-production') return acc + 1;
        return acc;
      }, 0) /
        errors?.[currentProject]?.length) *
      100
    ).toFixed(2);
  };

  return (
    <div>
      <Head>
        <title>Error Tracker</title>
        <meta name='description' content='Error Tracker' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1'
        />
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
              className='float-right -mb-5 cursor-pointer text-3xl text-white lg:hidden'
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
                {project.map((projectItem) => {
                  return (
                    <Sidebar.Item
                      active={currentProject === projectItem}
                      className={clsx(
                        'cursor-pointer hover:!bg-red-500',
                        currentProject === projectItem && '!bg-red-600'
                      )}
                      onClick={() => handleChangeProject(projectItem)}
                      key={projectItem}
                    >
                      {editProject === projectItem ? (
                        <div className='flex items-center justify-between border-b border-white py-2 px-5'>
                          <input
                            className='mr-3 w-full appearance-none border-none bg-transparent py-1 px-0 leading-tight text-white placeholder:text-gray-200 focus:outline-none focus:ring-0 focus:ring-offset-0'
                            type='text'
                            name='editProjectInput'
                            key={projectItem}
                            autoFocus
                            onChange={(e) => {
                              handleChangeEditProject(e);
                            }}
                            value={editProjectInput}
                            placeholder='My project'
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                (project.includes(editProjectInput) ||
                                  !editProjectInput) &&
                                editProjectInput !== projectItem
                              ) {
                                toast.error('Project must have unique name');
                                return;
                              }
                              setCurrentProject(editProjectInput);
                              setEditProject('');
                              setEditProjectInput('');

                              // Edit the project name
                              if (editProjectInput !== projectItem) {
                                setErrors((errors) => {
                                  const newErrors = cloneDeep(errors);
                                  newErrors[editProjectInput] =
                                    newErrors[projectItem];
                                  delete newErrors[projectItem];
                                  return newErrors;
                                });
                              }

                              // Use splice to edit project name in project list
                              setProject((project) => {
                                const index = project.indexOf(projectItem);
                                project.splice(index, 1, editProjectInput);
                                return project;
                              });
                            }}
                            disabled={!editProjectInput}
                          >
                            <FaPlus className='my-auto cursor-pointer text-white' />
                          </button>
                        </div>
                      ) : (
                        <div className='flex items-center justify-between text-white'>
                          {projectItem}
                          <span className='flex flex-row gap-2'>
                            <Tooltip content='Edit Name'>
                              <FaEdit
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditProject(projectItem);
                                  setEditProjectInput(projectItem);
                                }}
                              />
                            </Tooltip>
                            <Tooltip content='Delete Project'>
                              <FaTrash
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(projectItem);
                                }}
                              />
                            </Tooltip>
                          </span>
                        </div>
                      )}
                    </Sidebar.Item>
                  );
                })}
                <div className='flex items-center justify-between border-b border-white py-2 px-5'>
                  <input
                    className='mr-3 w-full appearance-none border-none bg-transparent py-1 px-0 leading-tight text-white placeholder:text-gray-200 focus:outline-none focus:ring-0 focus:ring-offset-0'
                    type='text'
                    onChange={(e) => {
                      setProjectInputLocation('top');
                      handleChange(e);
                    }}
                    value={projectInputLocation === 'top' ? projectInput : ''}
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
          <div className='mb-3 flex flex-wrap justify-between md:flex-nowrap'>
            <AiOutlineMenu
              onClick={toggleMenu}
              className='my-auto cursor-pointer text-4xl text-red-400 lg:hidden'
            />
            <Input
              type='text'
              className='rounded'
              placeholder='Search title'
              addOn={<FaSearch className='text-white' />}
              onChange={({ target }) => setSearch(target.value)}
            />
            <div className='order-3 my-auto mt-3 w-full text-center font-bold md:order-none md:w-auto'>
              DRE: {getDre()} % | Total: {errors?.[currentProject]?.length || 0}
            </div>
            <Button
              color='failure'
              className='float-right'
              onClick={() => openModal('new', {})}
              disabled={!currentProject}
            >
              Add Error
            </Button>
          </div>
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
          {errors?.[currentProject]?.length > 0 &&
          currentProject &&
          project.includes(currentProject) ? (
            <>
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
                  {getErrors().map((error, i) => {
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
                          <Badge
                            className='justify-center'
                            color={getStatusColor(status)}
                          >
                            {status}
                          </Badge>
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
              <CSVLink
                filename={`${currentProject}_errors.csv`}
                data={errors?.[currentProject] || []}
                onClick={() => {
                  toast.success('Exported to CSV');
                }}
              >
                <Button color='primary' className='float-right mt-5'>
                  Export to CSV
                </Button>
              </CSVLink>
            </>
          ) : loading ? (
            <div className='flex flex-col items-center justify-center'>
              <h1 className='text-2xl font-bold text-gray-500'>Loading...</h1>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center'>
              <h1 className='text-2xl font-bold text-gray-500'>
                {!currentProject ? (
                  <>
                    Create {project?.length > 0 && 'or select'} a project
                    <div className='flex items-center justify-between border-b border-gray-500 py-2 px-5'>
                      <input
                        className='mr-3 w-full appearance-none border-none bg-transparent py-1 px-0 leading-tight text-gray-500 placeholder:text-gray-200 focus:outline-none focus:ring-0 focus:ring-offset-0'
                        type='text'
                        onChange={(e) => {
                          setProjectInputLocation('bottom');
                          handleChange(e);
                        }}
                        value={
                          projectInputLocation === 'bottom' ? projectInput : ''
                        }
                        placeholder='My project'
                        aria-label='Project name'
                      />
                      <button
                        onClick={handleAddProject}
                        disabled={!projectInput}
                      >
                        <FaPlus className='my-auto cursor-pointer text-gray-500' />
                      </button>
                    </div>
                  </>
                ) : (
                  'No errors found'
                )}
              </h1>
            </div>
          )}
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
