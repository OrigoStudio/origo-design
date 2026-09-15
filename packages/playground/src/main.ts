import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { PreviewRootComponent } from './preview/preview-root.component';
import { initDevToolsBridge, _injectTestState } from '@origo/angular-renderer';

const mockDomainJson = {
  id: 'dom-identity',
  name: 'Identity Management',
  version: '1.0.0',
  domain: 'core',
  entities: [
    {
      id: 'ent-user',
      name: 'User',
      fields: [
        {
          id: 'fld-user-id',
          name: 'id',
          type: 'string',
          label: 'User ID',
          validation: ['required', 'uuid'],
          metadata_path: '/user/id',
        },
        {
          id: 'fld-user-username',
          name: 'username',
          type: 'string',
          label: 'Username',
          validation: ['required', 'min:3', 'max:50'],
          metadata_path: '/user/username',
        },
        {
          id: 'fld-user-email',
          name: 'email',
          type: 'string',
          label: 'Email Address',
          validation: ['required', 'email'],
          metadata_path: '/user/email',
        },
        {
          id: 'fld-user-roleId',
          name: 'roleId',
          type: 'string',
          label: 'Assigned Role',
          references: 'ent-role',
          validation: ['required'],
          metadata_path: '/user/roleId',
        },
      ],
    },
    {
      id: 'ent-role',
      name: 'Role',
      fields: [
        {
          id: 'fld-role-id',
          name: 'id',
          type: 'string',
          label: 'Role ID',
          validation: ['required', 'uuid'],
          metadata_path: '/role/id',
        },
        {
          id: 'fld-role-name',
          name: 'name',
          type: 'string',
          label: 'Role Name',
          validation: ['required'],
          metadata_path: '/role/name',
        },
        {
          id: 'fld-role-permissions',
          name: 'permissions',
          type: 'array',
          itemType: 'string',
          label: 'Permissions List',
          validation: [],
          metadata_path: '/role/permissions',
        },
      ],
    },
  ],
};

_injectTestState(mockDomainJson);
initDevToolsBridge();

if (window.location.search.includes('preview=true')) {
  bootstrapApplication(PreviewRootComponent, appConfig).catch(err => console.error(err));
} else {
  bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
}
