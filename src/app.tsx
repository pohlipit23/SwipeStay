import { Route, Switch } from 'wouter-preact'
import { AppShell } from './components/layout/AppShell'
import { SearchPage } from './components/search/SearchPage'
import { DeckPage } from './components/deck/DeckPage'
import { ComparePage } from './components/compare/ComparePage'
import { RoomSelectionPage } from './components/rooms/RoomSelectionPage'
import { CheckoutPage } from './components/checkout/CheckoutPage'
import { AiAssistantPage } from './components/ai/AiAssistantPage'

export function App() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={SearchPage} />
        <Route path="/results" component={DeckPage} />
        <Route path="/compare" component={ComparePage} />
        <Route path="/compare/:hotelId/rooms" component={RoomSelectionPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/assistant" component={AiAssistantPage} />
        <Route>
          <div class="flex items-center justify-center h-full text-slate-400">Page not found</div>
        </Route>
      </Switch>
    </AppShell>
  )
}
