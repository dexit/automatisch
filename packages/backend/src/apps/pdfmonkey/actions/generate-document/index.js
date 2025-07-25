import defineAction from '../../../../helpers/define-action.js';

export default defineAction({
  name: 'Generate document',
  key: 'generateDocument',
  description: 'Creates a new document.',
  arguments: [
    {
      label: 'Workspace',
      key: 'workspaceId',
      type: 'dropdown',
      required: true,
      description: '',
      variables: true,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [
          {
            name: 'key',
            value: 'listWorkspaces',
          },
        ],
      },
    },
    {
      label: 'Template',
      key: 'templateId',
      type: 'dropdown',
      required: false,
      depensOn: ['parameters.workspaceId'],
      description: '',
      variables: true,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [
          {
            name: 'key',
            value: 'listTemplates',
          },
          {
            name: 'parameters.workspaceId',
            value: '{parameters.workspaceId}',
          },
        ],
      },
    },
    {
      label: 'Use a Custom Json Structure?',
      key: 'useCustomJsonStructure',
      type: 'dropdown',
      required: true,
      description:
        'Please indicate "yes" if you would rather create a full JSON payload instead of relying on Automatisch mapping for the Document data.',
      variables: true,
      options: [
        {
          label: 'Yes',
          value: true,
        },
        {
          label: 'No',
          value: false,
        },
      ],
      additionalFields: {
        type: 'query',
        name: 'getDynamicFields',
        arguments: [
          {
            name: 'key',
            value: 'listDocumentData',
          },
          {
            name: 'parameters.useCustomJsonStructure',
            value: '{parameters.useCustomJsonStructure}',
          },
        ],
      },
    },
    {
      label: 'Custom Filename',
      key: 'customFilename',
      type: 'string',
      required: false,
      description:
        'You have the option to define a custom filename for generated documents. If left blank, a random value will be assigned.',
      variables: true,
    },
    {
      label: 'Meta Data',
      key: 'metaData',
      type: 'dynamic',
      required: false,
      description:
        'Extra information appended to the generated Document but not accessible within its Template.',
      fields: [
        {
          label: 'Key',
          key: 'metaDataKey',
          type: 'string',
          required: false,
          description: '',
          variables: true,
        },
        {
          label: 'Value',
          key: 'metaDataValue',
          type: 'string',
          required: false,
          description: '',
          variables: true,
        },
      ],
    },
  ],

  async run($) {
    const {
      templateId,
      useCustomJsonStructure,
      customJsonPayload,
      customFilename,
      documentData,
      metaData,
    } = $.step.parameters;
    let payload = {};
    let meta = {};

    const metaDataObject = metaData.reduce((result, entry) => {
      const key = entry.metaDataKey;
      const value = entry.metaDataValue;

      if (key && value) {
        return {
          ...result,
          [entry.metaDataKey]: entry.metaDataValue,
        };
      }

      return result;
    }, {});

    if (metaDataObject) {
      meta = metaDataObject;
    }

    if (customFilename) {
      meta._filename = customFilename;
    }

    if (useCustomJsonStructure) {
      payload = JSON.parse(customJsonPayload);
    } else {
      payload = documentData.reduce((result, entry) => {
        const key = entry.documentDataKey;
        const value = entry.documentDataValue;

        if (key && value) {
          return {
            ...result,
            [entry.documentDataKey]: entry.documentDataValue,
          };
        }

        return result;
      }, {});
    }

    const body = {
      document: {
        document_template_id: templateId,
        meta: JSON.stringify(meta),
        payload: JSON.stringify(payload),
        status: 'pending',
      },
    };

    const { data } = await $.http.post('/v1/documents', body);

    $.setActionItem({
      raw: data,
    });
  },
});
