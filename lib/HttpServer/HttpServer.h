////////////////////////////////////////////////////////////////////////////////
/// @brief http server
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2014-2015 ArangoDB GmbH, Cologne, Germany
/// Copyright 2004-2014 triAGENS GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Dr. Frank Celler
/// @author Achim Brandt
/// @author Jan Steemann
/// @author Copyright 2014-2015, ArangoDB GmbH, Cologne, Germany
/// @author Copyright 2009-2014, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

#ifndef ARANGODB_GENERAL_SERVER_GENERAL_SERVER_H
#define ARANGODB_GENERAL_SERVER_GENERAL_SERVER_H 1

#include "Scheduler/TaskManager.h"

#include "Basics/locks.h"
#include "Rest/ConnectionInfo.h"
#include "Rest/Handler.h"

// #define TRI_USE_SPIN_LOCK_GENERAL_SERVER 1

#ifdef TRI_USE_SPIN_LOCK_GENERAL_SERVER
#define GENERAL_SERVER_LOCK_TYPE TRI_spin_t
#define GENERAL_SERVER_INIT TRI_InitSpin
#define GENERAL_SERVER_DESTROY TRI_DestroySpin
#define GENERAL_SERVER_LOCK TRI_LockSpin
#define GENERAL_SERVER_UNLOCK TRI_UnlockSpin
#else
#define GENERAL_SERVER_LOCK_TYPE TRI_mutex_t
#define GENERAL_SERVER_INIT TRI_InitMutex
#define GENERAL_SERVER_DESTROY TRI_DestroyMutex
#define GENERAL_SERVER_LOCK TRI_LockMutex
#define GENERAL_SERVER_UNLOCK TRI_UnlockMutex
#endif

// -----------------------------------------------------------------------------
// --SECTION--                                                  class HttpServer
// -----------------------------------------------------------------------------

namespace triagens {
  namespace rest {
    class AsyncJobManager;
    class Dispatcher;
    class EndpointList;
    class HttpServerJob;
    class HttpCommTask;
    class HttpHandler;
    class HttpHandlerFactory;
    class Job;
    class ListenTask;

////////////////////////////////////////////////////////////////////////////////
/// @brief general server
////////////////////////////////////////////////////////////////////////////////

    class HttpServer : protected TaskManager {
      HttpServer (HttpServer const&) = delete;
      HttpServer const& operator= (HttpServer const&) = delete;

// -----------------------------------------------------------------------------
// --SECTION--                                             static public methods
// -----------------------------------------------------------------------------

      public:

////////////////////////////////////////////////////////////////////////////////
/// @brief destroys an endpoint server
////////////////////////////////////////////////////////////////////////////////

        static int sendChunk (uint64_t, const std::string&);
        
// -----------------------------------------------------------------------------
// --SECTION--                                      constructors and destructors
// -----------------------------------------------------------------------------

      public:

////////////////////////////////////////////////////////////////////////////////
/// @brief constructs a new general server with dispatcher and job manager
////////////////////////////////////////////////////////////////////////////////

        HttpServer (Scheduler*,
                    Dispatcher*,
                    HttpHandlerFactory*,
                    AsyncJobManager*,
                    double keepAliveTimeout);

////////////////////////////////////////////////////////////////////////////////
/// @brief destructs a general server
////////////////////////////////////////////////////////////////////////////////

        virtual ~HttpServer ();

// -----------------------------------------------------------------------------
// --SECTION--                                            virtual public methods
// -----------------------------------------------------------------------------

      public:

////////////////////////////////////////////////////////////////////////////////
/// @brief returns the protocol
////////////////////////////////////////////////////////////////////////////////

        virtual const char* protocol () const;

////////////////////////////////////////////////////////////////////////////////
/// @brief returns the encryption to be used
////////////////////////////////////////////////////////////////////////////////

        virtual Endpoint::EncryptionType encryptionType () const;

////////////////////////////////////////////////////////////////////////////////
/// @brief generates a suitable communication task
////////////////////////////////////////////////////////////////////////////////

        virtual HttpCommTask* createCommTask (TRI_socket_t, const ConnectionInfo&);

// -----------------------------------------------------------------------------
// --SECTION--                                                    public methods
// -----------------------------------------------------------------------------

      public:

////////////////////////////////////////////////////////////////////////////////
/// @brief returns the scheduler
////////////////////////////////////////////////////////////////////////////////

        Scheduler* scheduler () const;

////////////////////////////////////////////////////////////////////////////////
/// @brief returns the dispatcher
////////////////////////////////////////////////////////////////////////////////

        Dispatcher* dispatcher () const;

////////////////////////////////////////////////////////////////////////////////
/// @brief return the handler factory
////////////////////////////////////////////////////////////////////////////////

        HttpHandlerFactory* handlerFactory () const;

////////////////////////////////////////////////////////////////////////////////
/// @brief adds the endpoint list
////////////////////////////////////////////////////////////////////////////////

        void setEndpointList (const EndpointList* list);

////////////////////////////////////////////////////////////////////////////////
/// @brief adds another endpoint at runtime
////////////////////////////////////////////////////////////////////////////////

        bool addEndpoint (Endpoint*);

////////////////////////////////////////////////////////////////////////////////
/// @brief removes an endpoint at runtime
////////////////////////////////////////////////////////////////////////////////

        bool removeEndpoint (Endpoint*);

////////////////////////////////////////////////////////////////////////////////
/// @brief starts listening
////////////////////////////////////////////////////////////////////////////////

        void startListening ();

////////////////////////////////////////////////////////////////////////////////
/// @brief stops listining
////////////////////////////////////////////////////////////////////////////////

        void stopListening ();

////////////////////////////////////////////////////////////////////////////////
/// @brief registers a chunked task
////////////////////////////////////////////////////////////////////////////////

        void registerChunkedTask (HttpCommTask*, ssize_t);

////////////////////////////////////////////////////////////////////////////////
/// @brief unregisters a chunked task
////////////////////////////////////////////////////////////////////////////////

        void unregisterChunkedTask (HttpCommTask*);

////////////////////////////////////////////////////////////////////////////////
/// @brief shuts down all handlers
////////////////////////////////////////////////////////////////////////////////

        void shutdownHandlers ();

////////////////////////////////////////////////////////////////////////////////
/// @brief removes all listen and comm tasks
////////////////////////////////////////////////////////////////////////////////

        void stop ();

////////////////////////////////////////////////////////////////////////////////
/// @brief handles connection request
////////////////////////////////////////////////////////////////////////////////

        void handleConnected (TRI_socket_t s, const ConnectionInfo& info);

////////////////////////////////////////////////////////////////////////////////
/// @brief handles a connection close
////////////////////////////////////////////////////////////////////////////////

        void handleCommunicationClosed (HttpCommTask*);

////////////////////////////////////////////////////////////////////////////////
/// @brief handles a connection failure
////////////////////////////////////////////////////////////////////////////////

        void handleCommunicationFailure (HttpCommTask*);

////////////////////////////////////////////////////////////////////////////////
/// @brief callback if the handler received a signal
////////////////////////////////////////////////////////////////////////////////

        void handleAsync (HttpCommTask*);

////////////////////////////////////////////////////////////////////////////////
/// @brief creates a job for asynchronous execution
////////////////////////////////////////////////////////////////////////////////

        bool handleRequestAsync (HttpHandler*, uint64_t* jobId);

////////////////////////////////////////////////////////////////////////////////
/// @brief executes the handler directly or add it to the queue
////////////////////////////////////////////////////////////////////////////////

        bool handleRequest (HttpCommTask*, HttpHandler*);

////////////////////////////////////////////////////////////////////////////////
/// @brief callback if job is done
////////////////////////////////////////////////////////////////////////////////

        void jobDone (Job*);

// -----------------------------------------------------------------------------
// --SECTION--                                                   protected types
// -----------------------------------------------------------------------------

      protected:

////////////////////////////////////////////////////////////////////////////////
/// @brief Handler, Job, and Task tuple
////////////////////////////////////////////////////////////////////////////////

        struct handler_task_job_t {
          HttpHandler* _handler;
          HttpCommTask* _task;
          HttpServerJob* _job;
        };

// -----------------------------------------------------------------------------
// --SECTION--                                                 protected methods
// -----------------------------------------------------------------------------

      protected:

////////////////////////////////////////////////////////////////////////////////
/// @brief opens a listen port
////////////////////////////////////////////////////////////////////////////////

        bool openEndpoint (Endpoint* endpoint);

////////////////////////////////////////////////////////////////////////////////
/// @brief handle request directly
////////////////////////////////////////////////////////////////////////////////

        Handler::status_t handleRequestDirectly (HttpCommTask* task, HttpHandler * handler);

////////////////////////////////////////////////////////////////////////////////
/// @brief shut downs a handler for a task
////////////////////////////////////////////////////////////////////////////////

        void shutdownHandlerByTask (Task* task);

////////////////////////////////////////////////////////////////////////////////
/// @brief registers a task
////////////////////////////////////////////////////////////////////////////////

        void registerHandler (HttpHandler* handler, HttpCommTask* task);

////////////////////////////////////////////////////////////////////////////////
/// @brief registers a new job
////////////////////////////////////////////////////////////////////////////////

        void registerJob (HttpHandler* handler, HttpServerJob* job);

// -----------------------------------------------------------------------------
// --SECTION--                                               protected variables
// -----------------------------------------------------------------------------

      protected:

////////////////////////////////////////////////////////////////////////////////
/// @brief the scheduler
////////////////////////////////////////////////////////////////////////////////

        Scheduler* _scheduler;

////////////////////////////////////////////////////////////////////////////////
/// @brief the dispatcher
////////////////////////////////////////////////////////////////////////////////

        Dispatcher* _dispatcher;

////////////////////////////////////////////////////////////////////////////////
/// @brief the handler factory
////////////////////////////////////////////////////////////////////////////////

        HttpHandlerFactory* _handlerFactory;

////////////////////////////////////////////////////////////////////////////////
/// @brief the job manager
////////////////////////////////////////////////////////////////////////////////

        AsyncJobManager* _jobManager;

////////////////////////////////////////////////////////////////////////////////
/// @brief active listen tasks
////////////////////////////////////////////////////////////////////////////////

        std::vector<ListenTask*> _listenTasks;

////////////////////////////////////////////////////////////////////////////////
/// @brief defined ports and addresses
////////////////////////////////////////////////////////////////////////////////

        const EndpointList* _endpointList;

////////////////////////////////////////////////////////////////////////////////
/// @brief mutex for comm tasks
////////////////////////////////////////////////////////////////////////////////

        GENERAL_SERVER_LOCK_TYPE _commTasksLock;

////////////////////////////////////////////////////////////////////////////////
/// @brief active comm tasks
////////////////////////////////////////////////////////////////////////////////

        std::set<HttpCommTask*> _commTasks;

////////////////////////////////////////////////////////////////////////////////
/// @brief mutex for mapping structures
////////////////////////////////////////////////////////////////////////////////

        GENERAL_SERVER_LOCK_TYPE _mappingLock;

////////////////////////////////////////////////////////////////////////////////
/// @brief map handler to task
////////////////////////////////////////////////////////////////////////////////

        std::unordered_map<HttpHandler*, handler_task_job_t> _handlers;

////////////////////////////////////////////////////////////////////////////////
/// @brief map task to handler
////////////////////////////////////////////////////////////////////////////////

        std::unordered_map<Task*, handler_task_job_t> _task2handler;

////////////////////////////////////////////////////////////////////////////////
/// @brief keep-alive timeout
////////////////////////////////////////////////////////////////////////////////

        double _keepAliveTimeout;
    };
  }
}

#endif

// -----------------------------------------------------------------------------
// --SECTION--                                                       END-OF-FILE
// -----------------------------------------------------------------------------

// Local Variables:
// mode: outline-minor
// outline-regexp: "/// @brief\\|/// {@inheritDoc}\\|/// @page\\|// --SECTION--\\|/// @\\}"
// End:
