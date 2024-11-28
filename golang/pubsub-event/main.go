package main

import (
	"main/event_async"
	"main/events"
)

func main() {
	event_async.NewPublisher("somethingEvent")
	defer event_async.Listen()

	event_async.PublishMessage("somethingEvent", event_async.Message{
		Data: map[string]interface{}{
			"item":   "Samsung",
			"source": "Korea",
		},
	})

	event_async.AddSubscriber(
		"somethingEvent",
		event_async.NewSubscriber(
			events.SomethingEvent{},
			1,
			"comment for you event",
		),
	)

	event_async.PublishMessage("somethingEvent", event_async.Message{
		Data: map[string]interface{}{
			"item":   "Apple",
			"source": "USA",
		},
	})
}
