import * as testing from '@firebase/testing'

const projectId = 'boteditor-firestore-testing'

const authedApp = (auth) => {
  return testing.initializeTestApp({ projectId, auth }).firestore()
}

beforeEach(async () => {
  await testing.clearFirestoreData({ projectId })
})

afterAll(async () => {
  await Promise.all(testing.apps().map(app => app.delete()))
})

describe('BotEditor firestore database', () => {
  it('should create a project', async () => {
    const db = authedApp(null)
    const project = db.collection('projects').doc()
    await testing.assertSucceeds(
      project.set({
        title: 'My first project'
      })
    )
  })
})
