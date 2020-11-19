import React from "react"
import { Link } from "gatsby"

const Layout = ({ location, title, children }) => {
  return (
    <>
      <header className="site-head">
        <div className="kr-wrapper">
          <span className="terminal-prompt">
            <Link to="/">venikx.com</Link> λ <Link to="/">blog</Link>/
            <Link to="/">lol</Link>/
            <Link to="/">hello-goodbye-loller-in-de-trousers</Link>/
          </span>
          <nav className="site-nav">
            <ul>
              <li>
                <Link to="/">About/</Link>
              </li>

              <li>
                <Link to="/">Posts/</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </>
  )
}

export default Layout
