import { gql } from '@apollo/client';

export const GET_ORGANIZATION_BY_SLUG = gql`
  query GetOrganizationBySlug($slug: String!) {
    organizationBySlug(slug: $slug) {
      id
      name
      slug
      contactEmail
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
      organization {
        id
        name
        slug
      }
    }
  }
`;

export const GET_PROJECTS_BY_ORG = gql`
  query GetProjectsByOrg($orgSlug: String!) {
    projectsByOrg(orgSlug: $orgSlug) {
      id
      name
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
      organization {
        id
        name
        slug
      }
    }
  }
`;

export const GET_ALL_PROJECTS = gql`
  query GetAllProjects {
    allProjects {
      id
      name
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
      organization {
        id
        slug
      }
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      assigneeEmail
      createdAt
      updatedAt
      project {
        id
        name
      }
    }
  }
`;

export const GET_TASKS_BY_PROJECT = gql`
  query GetTasksByProject($projectId: ID!) {
    tasksByProject(projectId: $projectId) {
      id
      title
      description
      status
      priority
      assigneeEmail
      createdAt
      updatedAt
      project {
        id
      }
    }
  }
`;

export const GET_COMMENTS_BY_TASK = gql`
  query GetCommentsByTask($taskId: ID!) {
    commentsByTask(taskId: $taskId) {
      id
      content
      authorEmail
      createdAt
      task {
        id
      }
    }
  }
`;

