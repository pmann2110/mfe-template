export interface Organization {
  id: string;
  name: string;
  slug?: string;
  /** When true, this org represents the platform. */
  isSystemOrg?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
}

export interface OrganizationApi {
  list: () => Promise<Organization[]>;
  get: (id: string) => Promise<Organization>;
  create: (data: CreateOrganizationRequest) => Promise<Organization>;
  update: (id: string, data: UpdateOrganizationRequest) => Promise<Organization>;
  delete: (id: string) => Promise<void>;
}
