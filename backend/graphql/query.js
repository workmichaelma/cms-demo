import fs from 'fs'
import path from 'path'

const normalizedPath = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '../collections/'
)

const getQueries = async () => {
  const queries = [
    `#graphql
	    scalar File
      scalar Money
      scalar JSON

      enum Collection {
        _
      }
      enum Order {
        DESC
        ASC
      }
      type _ {
        _id: String
      }

      union Entity = _
      union ListingResultData = _
      input EntityInput
      input ImportEntityInput
      input ListingFilter {
        field: String
        operator: String
        value: String
      }
      input ListingSort {
        field: String
        order: Order
      }
      type ListingResult {
        metadata: ListingResultMetadata
        data: [ListingResultData]
      }
      type ListingResultMetadata {
        page: Int
        pageSize: Int
        hasNextPage: Boolean
        hasPrevPage: Boolean
        totalPages: Int
        total: Int
        pipeline: JSON
      }

      type Page {
        schema: [Schema]
        pageConfig(page: String, tab: String): PageConfig
        fieldsToDisplay: [String]
      }
      type Schema {
        field: String
        title: String
        type: String
        placeholder: String
        is_required: Boolean
        is_password: Boolean
        is_multiple: Boolean
        is_phone: Boolean
        is_email: Boolean
        select: Boolean
        options: [String]
        free_solo: Boolean
        editable: Boolean
        is_number_only: Boolean
        disabled: Boolean
        maxlength: Int
        checkbox: [String]
        with_entities_options: JSON
        target_id: Boolean
      }

      type PageConfig {
        page: String
        fieldsToDisplay: [String]
        tab: PageTab
        tabHeaders: [PageTabHeader]
      }
      type PageTab {
        title: String
        fieldsToDisplay: [String]
        setting: PageTabSetting
        schema: [Schema]
      }
      type PageTabSetting {
        collection: Collection
        editable: Boolean
        deletable: Boolean
        addable: Boolean
        copyable: Boolean
        showPopup: Boolean
        prefix: String
        path: String
      }
      type PageTabHeader {
        title: String
        key: String
      }

      type Query {
        health: Boolean
        entity(collection: Collection!, _id: ID!): Entity
        entities(collection: Collection!): [Entity]
        entityDistinctField(collection: Collection!, field: String): [String]
        listing(collection: Collection!, filter: [ListingFilter], sort: ListingSort, page: Int, pageSize: Int): ListingResult
        page(collection: Collection!): Page
      }

      type Mutation {
        isHealthy: Boolean
        insertEntity(collection: Collection!, body: EntityInput): ID
        updateEntity(collection: Collection!, _id: ID!, body: EntityInput): Boolean
        deleteEntity(collection: Collection!, _id: ID!): Boolean
        importEntities(collection: Collection!, body: ImportEntityInput): Int
      }
    `,
  ]
  for (const folder of fs.readdirSync(normalizedPath)) {
    const query = await import(`../collections/${folder}/query.js`)
    queries.push(query.query)
  }

  return queries
}

export default {
  getQueries,
}
