import React from 'react'
import { Link } from 'gatsby'

import './reset.css'
import './layout.css'

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props
    const rootPath = `${__PATH_PREFIX__}/`
    const header = (
      <div className="sidebar">
        <Link to={`/`}>K</Link>
        <nav>
          <ul>
            <li>
              <a>Blog</a>
            </li>
            <li>
              <a>Labs</a>
            </li>
            <li>
              <a>About</a>
            </li>
          </ul>
        </nav>
        <div className="pageTitle">
          <span />
          <h1>Blog</h1>
          <span />
        </div>
      </div>
    )

    return (
      <div className="container">
        {header}
        <main>{children}</main>
        <footer>
          Copyright (C) {new Date().getFullYear()} Kevin 'Rangel' De
          Baerdemaeker, licenced under{' '}
          <a
            rel="license"
            href="http://creativecommons.org/licenses/by-nc/4.0/"
          >
            Creative Commons Attribution-NonCommercial 4.0 International License
          </a>
          .
        </footer>
      </div>
    )
  }
}

export default Layout
