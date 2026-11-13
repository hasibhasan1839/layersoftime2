import { Component } from 'react';

/** Catches render-time crashes so one broken page never blanks the whole site. */
export class AppErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="container" role="alert" style={{ paddingBlock: '3rem' }}>
          <h1>Something went wrong</h1>
          <p>This page failed to display. Reload the page, or use the menu to go somewhere else.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
