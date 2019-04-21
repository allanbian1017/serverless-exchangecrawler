'use strict';

const gcloud = require('@google-cloud/bigquery');

const BigQuery = class {
  /**
   * Constructor for BigQuery object.
   *
   * @param {String} projectId project id.
   * @param {String} clientEmail client email.
   * @param {String} privateKey private key.
   */
  constructor(projectId, clientEmail, privateKey) {
    this.client = new gcloud.BigQuery({
      projectId: projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
  }

  /**
   * Stream insert
   *
   * @param {Context} context context.
   * @param {String} datasets Datasets id.
   * @param {String} table table id.
   * @param {Array} rows rows to insert.
   * @return {Promise}
   */
  async streamInsert(context, datasets, table, rows) {
    await this.client
      .dataset(datasets)
      .table(table)
      .insert(rows);
    return {};
  }
};

module.exports = BigQuery;
