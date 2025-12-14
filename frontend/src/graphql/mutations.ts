import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $organizationSlug: String!
    $name: String!
    $status: String
    $priority: String
    $description: String
    $dueDate: Date
  ) {
    createProject(
      organizationSlug: $organizationSlug
      name: $name
      status: $status
      priority: $priority
      description: $description
      dueDate: $dueDate
    ) {
      project {
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
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: ID!
    $name: String
    $status: String
    $priority: String
    $description: String
    $dueDate: Date
  ) {
    updateProject(
      id: $id
      name: $name
      status: $status
      priority: $priority
      description: $description
      dueDate: $dueDate
    ) {
      project {
        id
        name
        description
        status
        priority
        dueDate
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      success
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask(
    $projectId: ID!
    $title: String!
    $description: String
    $status: String
    $priority: String
    $assigneeEmail: String
  ) {
    createTask(
      projectId: $projectId
      title: $title
      description: $description
      status: $status
      priority: $priority
      assigneeEmail: $assigneeEmail
    ) {
      task {
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
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $title: String
    $description: String
    $status: String
    $priority: String
    $assigneeEmail: String
  ) {
    updateTask(
      id: $id
      title: $title
      description: $description
      status: $status
      priority: $priority
      assigneeEmail: $assigneeEmail
    ) {
      task {
        id
        title
        description
        status
        priority
        assigneeEmail
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      success
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($taskId: ID!, $content: String!, $authorEmail: String!) {
    addComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
      comment {
        id
        content
        authorEmail
        createdAt
        task {
          id
        }
      }
    }
  }
`;

