export interface NewsRelease {
    id: string;
    projectId: string;
    type: string;
    contactMemberId: string | null;
    headline: string;
    subhead: string;
    publishDate: string;
    publishedUrl: string;
    location: string;
    introduction: string;
    body: string;
    quotes: string;
    boilerplate: string;
    contactInfo: string;
    status: 'Draft' | 'For Review' | 'Approved';
    createdAt: string;
    updatedAt: string;
}

export interface Interaction {
  id: string;
  contactId: string;
  date: string;
  type: 'Email' | 'Call' | 'Meeting' | 'Note';
  notes: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  organization: string;
  contactType: string;
  associatedProjectIds: string[];
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}
