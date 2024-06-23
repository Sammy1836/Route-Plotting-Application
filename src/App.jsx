import logo from './assets/logo.png'
import './App.css'
import Form from './components/Form'

function App() {

  return (
    <>
      <div className="header">
        <img src={logo} alt="logo" />
      </div>

      <Form />

    </>
  )
}

export default App
