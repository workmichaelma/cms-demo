import logo from './logo.svg'
import './App.css'
import { MuiFileInput } from 'mui-file-input'
import { useEffect, useState } from 'react'
import {
	gql,
	useQuery,
	ApolloClient,
	ApolloProvider,
	InMemoryCache,
} from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'

const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: createUploadLink({
		uri: 'http://localhost:81/graphql',
		headers: {
			'Apollo-Require-Preflight': 'true',
		},
	}),
})
const q = gql`
	query ExampleQuery {
		books {
			author
		}
	}
`

function App() {
	return (
		<ApolloProvider client={client}>
			<On />
		</ApolloProvider>
	)
}

const On = () => {
	const [file, setFile] = useState(null)
	const { loading, error, data } = useQuery(q)
	console.log({ data })
	return (
		<div className='App'>
			<div>
				<MuiFileInput
					accept='.csv'
					color='primary'
					multiple
					onChange={(v) => {
						const mutation = gql`
							mutation UploadFile($file: Upload!, $name: [Text]) {
								uploadFile(file: $file, name: $name)
							}
						`
						client
							.mutate({
								mutation,
								variables: {
									file: v[0],
									name: [
										{ name: '123', age: 2 },
										{ name: '234', age: 5, file: v[0] },
									],
								},
							})
							.then((e) => {
								console.log(e)
							})
					}}
				/>
			</div>
		</div>
	)
}

export default App
