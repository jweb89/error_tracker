import Head from 'next/head';
import { useEffect, useState } from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import Input from '../components/input';
import Modal from '../components/modal';
import cloneDeep from 'lodash/cloneDeep';

export default function Home() {
  const [project, setProject] = useState([]);
  const [projectInput, setProjectInput] = useState('');
  const [errors, setErrors] = useState({});
  const [currentProject, setCurrentProject] = useState(null);

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
  }, []);

  const afterSave = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
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
  };

  const handleAddProject = () => {
    if (project.includes(projectInput) || !projectInput) {
      alert('Project must have unique name');
      return;
    }
    const newProject = [...project, projectInput];
    setProject(newProject);
    setProjectInput('');
    setCurrentProject(projectInput);
    afterSave('project', newProject);
    afterSave('currentProject', projectInput);
  };

  const handleAddError = (values) => {
    const newErrors = cloneDeep(errors);
    if (!newErrors[currentProject]) {
      newErrors[currentProject] = [];
    }
    newErrors[currentProject].push(values);
    setErrors(newErrors);
    afterSave('errors', newErrors);
  };

  return (
    <div>
      <Head>
        <title>Error Tracker</title>
        <meta name='description' content='Error Tracker' />
        <link rel='icon' href='/favicon2.ico' />
      </Head>

      <main className='absolute top-0 bottom-0 grid h-full w-full grid-cols-12'>
        <div className='col-span-3 h-full w-full bg-red-400 p-5'>
          <h1 className='mb-3 font-mono text-2xl font-bold text-white'>
            Error Tracker
          </h1>
          <ul className='text-lg text-white'>
            {project.map((project) => {
              return (
                <>
                  <li
                    className={currentProject === project && 'bg-black'}
                    onClick={() => setCurrentProject(project)}
                    key={project}
                  >
                    {project}
                    <FaTrash
                      className='float-right'
                      onClick={() => handleDelete(project)}
                    />
                  </li>
                </>
              );
            })}
          </ul>
          <div className='flex'>
            <Input
              onChange={handleChange}
              type='text'
              value={projectInput}
              placeholder='My project'
            />
            <FaPlus onClick={handleAddProject} className='my-auto text-white' />
          </div>
        </div>

        <div className='col-span-9 p-5'>
          <div className='mb-3 flex justify-between'>
            <Input type='text' className='rounded' placeholder='Search title' />
            <Modal handleAddError={handleAddError} />
          </div>
          <table className='w-full table-auto'>
            <thead>
              <tr>
                <th>Title</th>
                <th>Reported By</th>
                <th>Reported At</th>
                <th>Status</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {errors?.[currentProject]?.map(
                ({ title, reportedBy, reportedAt, status, severity }) => {
                  console.log(reportedAt);
                  return (
                    <tr key={title}>
                      <td>{title}</td>
                      <td>{reportedBy}</td>
                      <td>{reportedAt}</td>
                      <td>{status}</td>
                      <td>{severity}</td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
