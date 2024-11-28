package main

import (
	"main/events"
	"main/pkg/event_async"
)

func init() {
	event_async.NewPublisher("somethingEvent")
}

func main() {

	event_async.AddSubscriber(
		"somethingEvent",
		event_async.NewSubscriber(
			events.SomethingEvent{},
			1,
			"comment for you event",
		),
	)

	m := event_async.Message{
		Data: map[string]interface{}{
			"item":   "test",
			"source": "test2",
		},
	}

	event_async.PublishMessage("somethingEvent", m)

	event_async.Listen()
}
