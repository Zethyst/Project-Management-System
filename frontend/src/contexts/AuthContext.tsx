import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import type { User } from '../types/index';
import { GET_ORGANIZATION_BY_SLUG } from '@/graphql/queries';
import { gql } from '@apollo/client';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, organization: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mutation to create organization if it doesn't exist
const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $slug: String!, $contactEmail: String!) {
    createOrganization(name: $name, slug: $slug, contactEmail: $contactEmail) {
      organization {
        id
        name
        slug
        contactEmail
      }
    }
  }
`;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [createOrganizationMutation] = useMutation(CREATE_ORGANIZATION, {
    onCompleted: (data) => {
      if (data?.createOrganization?.organization) {
        const org = data.createOrganization.organization;
        const storedEmail = localStorage.getItem('pending_email') || '';
        const newUser: User = {
          id: crypto.randomUUID(),
          email: storedEmail,
          organization: org.name,
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.removeItem('pending_email');
        toast.success(`Created and logged in to ${org.name}`);
      }
    },
    onError: (error) => {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
      localStorage.removeItem('pending_email');
    },
  });

  const [getOrganization] = useLazyQuery(GET_ORGANIZATION_BY_SLUG, {
    onCompleted: (data) => {
      const storedEmail = localStorage.getItem('pending_email') || '';
      if (data?.organizationBySlug) {
        // Organization exists, proceed with login
        const newUser: User = {
          id: crypto.randomUUID(),
          email: storedEmail,
          organization: data.organizationBySlug.name,
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.removeItem('pending_email');
        toast.success(`Logged in to ${data.organizationBySlug.name}`);
      } else {
        // Organization doesn't exist, create it
        const orgSlug = localStorage.getItem('pending_org_slug') || '';
        const orgName = localStorage.getItem('pending_org_name') || '';
        createOrganizationMutation({
          variables: {
            name: orgName,
            slug: orgSlug,
            contactEmail: storedEmail,
          },
        });
      }
    },
    onError: (error) => {
      console.error('Error fetching organization:', error);
      // If organization doesn't exist, create it
      const storedEmail = localStorage.getItem('pending_email') || '';
      const orgSlug = localStorage.getItem('pending_org_slug') || '';
      const orgName = localStorage.getItem('pending_org_name') || '';
      createOrganizationMutation({
        variables: {
          name: orgName,
          slug: orgSlug,
          contactEmail: storedEmail,
        },
      });
    },
  });

  const login = async (email: string, organization: string) => {
    // Store email and organization temporarily
    localStorage.setItem('pending_email', email);
    localStorage.setItem('pending_org_name', organization);
    
    // Convert organization name to slug
    const orgSlug = organization.toLowerCase().replace(/\s+/g, '-');
    localStorage.setItem('pending_org_slug', orgSlug);

    // Check if organization exists
    getOrganization({
      variables: { slug: orgSlug },
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('pending_email');
    localStorage.removeItem('pending_org_slug');
    localStorage.removeItem('pending_org_name');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
